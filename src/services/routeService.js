import apiClient from "./api.config";

export const routeService = {
  // Lấy danh sách routes
  getAllRoutes: async () => {
    try {
      const response = await apiClient.get("/routes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo route mới
  createRoute: async (routeData) => {
    try {
      const response = await apiClient.post("/routes", routeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết một route
  getRouteById: async (routeId) => {
    try {
      const response = await apiClient.get(`/routes/${routeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật route
  updateRoute: async (routeId, routeData) => {
    try {
      const response = await apiClient.put(`/routes/${routeId}`, routeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
