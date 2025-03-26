import apiClient from "./api.config";

export const groupService = {
  // Lấy danh sách groups có phân trang
  getGroupsByPage: async (page = 1, limit = 5) => {
    try {
      // Đầu tiên lấy tổng số items
      const totalResponse = await apiClient.get("/Groups");
      const total = totalResponse.data.length;

      // Tính offset để lấy đúng items cho trang hiện tại
      const start = (page - 1) * limit;
      const end = start + limit;

      // Lấy items cho trang hiện tại
      const response = await apiClient.get(
        `/Groups?page=${page}&limit=${limit}`
      );

      return {
        data: response.data,
        total: total, // Trả về tổng số items
      };
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách groups
  getAllGroups: async () => {
    try {
      const response = await apiClient.get("/Groups");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo group mới
  createGroup: async (groupData) => {
    try {
      const response = await apiClient.post("/Groups", {
        ...groupData,
        members: 0,
        isPrivate: groupData.isPrivate || false,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tham gia group
  joinGroup: async (groupId) => {
    try {
      const currentGroup = await apiClient.get(`/Groups/${groupId}`);

      // Nếu là private group, trả về response để UI xử lý chuyển hướng
      if (currentGroup.data.isPrivate) {
        return {
          isPrivate: true,
          groupId: groupId,
          message: "This is a private group",
          requiresAccess: true,
        };
      }

      const updatedGroup = {
        ...currentGroup.data,
        members: currentGroup.data.members + 1,
      };
      const response = await apiClient.put(`/Groups/${groupId}`, updatedGroup);
      return {
        ...response.data,
        isPrivate: false,
        requiresAccess: false,
      };
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách request access cho admin
  getAccessRequests: async (groupId) => {
    try {
      const response = await apiClient.get(
        `/GroupRequests?groupId=${groupId}&_sort=createdAt&_order=desc`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách request access của user
  getUserRequests: async (userId) => {
    try {
      const response = await apiClient.get(
        `/GroupRequests?userId=${userId}&_sort=createdAt&_order=desc`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Phê duyệt/từ chối request
  updateRequestStatus: async (requestId, status, message) => {
    try {
      const response = await apiClient.patch(`/GroupRequests/${requestId}`, {
        status,
        responseMessage: message,
        updatedAt: new Date().toISOString(),
      });

      // Nếu approve thì tự động join group
      if (status === "approved") {
        const request = response.data;
        await groupService.joinGroup(request.groupId);
      }

      // Gửi email notification
      await apiClient.post("/notifications/email", {
        type: "request_update",
        requestId,
        status,
        message,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Gửi yêu cầu tham gia group private
  requestAccess: async (groupId, message) => {
    try {
      const response = await apiClient.post(`/GroupRequests`, {
        groupId,
        message,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Gửi email notification cho admin
      await apiClient.post("/notifications/email", {
        type: "new_request",
        requestId: response.data.id,
        groupId,
        message,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết một group
  getGroupById: async (groupId) => {
    try {
      const response = await apiClient.get(`/Groups/${groupId}`);
      return {
        ...response.data,
        isPrivate: response.data.isPrivate || false,
      };
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật group
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await apiClient.put(`/Groups/${groupId}`, {
        ...groupData,
        isPrivate:
          groupData.isPrivate !== undefined ? groupData.isPrivate : false,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa group
  deleteGroup: async (groupId) => {
    try {
      const response = await apiClient.delete(`/Groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra quyền truy cập group
  checkGroupAccess: async (groupId) => {
    try {
      const group = await apiClient.get(`/Groups/${groupId}`);

      if (group.data.isPrivate) {
        // Kiểm tra xem user đã gửi request chưa
        const userRequests = await apiClient.get(
          `/GroupRequests?groupId=${groupId}&userId=${localStorage.getItem(
            "userId"
          )}&_sort=createdAt&_order=desc`
        );

        return {
          isPrivate: true,
          hasRequestedAccess: userRequests.data.length > 0,
          latestRequest: userRequests.data[0] || null,
          group: group.data,
        };
      }

      return {
        isPrivate: false,
        group: group.data,
      };
    } catch (error) {
      throw error;
    }
  },
};
