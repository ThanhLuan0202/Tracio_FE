import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { groupService } from "../../services/groupService";
import { routeService } from "../../services/routeService";

const GroupPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [routeData, setRouteData] = useState({
    startLocation: "",
    endLocation: "",
    distance: "",
    estimatedTime: "",
    share: "Private",
    description: "",
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(5);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");

  // Fetch groups with pagination
  const fetchGroups = async (page) => {
    try {
      setLoading(true);
      const response = await groupService.getGroupsByPage(page, itemsPerPage);
      setGroups(response.data);
      // Tính toán tổng số trang từ tổng số items
      const calculatedTotalPages = Math.ceil(response.total / itemsPerPage);
      setTotalPages(calculatedTotalPages);
    } catch (err) {
      setError("Failed to fetch groups");
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0); // Scroll to top when changing page
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = maxVisiblePages - leftOffset - 1;

      if (currentPage <= leftOffset) {
        endPage = maxVisiblePages;
      } else if (currentPage > totalPages - rightOffset) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = currentPage - leftOffset;
        endPage = currentPage + rightOffset;
      }
    }

    // Add first page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="w-8 h-8 flex items-center justify-center rounded bg-white hover:bg-gray-100 border border-gray-300"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Add pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            i === currentPage ? "bg-gray-200" : "bg-white hover:bg-gray-100"
          } border border-gray-300`}
        >
          {i}
        </button>
      );
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded bg-white hover:bg-gray-100 border border-gray-300"
        >
          {totalPages}
        </button>
      );
    }

    // Add Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 h-8 flex items-center justify-center rounded bg-white hover:bg-gray-100 border border-gray-300"
        >
          Next
        </button>
      );
    }

    return <div className="flex justify-center mt-8 space-x-2">{pages}</div>;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRouteInputChange = (e) => {
    const { name, value } = e.target;
    setRouteData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await groupService.createGroup(formData);
      // Refresh groups list after creating new group
      await fetchGroups(currentPage);
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to create group");
      console.error("Error creating group:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await routeService.createRoute(routeData);
      setIsRouteModalOpen(false);
      // Optionally show success message
    } catch (err) {
      setError("Failed to create route");
      console.error("Error creating route:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setLoading(true);
      const result = await groupService.joinGroup(groupId);

      if (result.requiresAccess) {
        // Nếu là private group, hiện form request
        setSelectedGroupId(groupId);
        setShowRequestForm(true);
      } else {
        // Nếu là public group, chuyển đến trang rules
        navigate(`/group-rules/${groupId}`);
      }
    } catch (err) {
      setError("Failed to join group");
      console.error("Error joining group:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await groupService.requestAccess(selectedGroupId, requestMessage);
      setShowRequestForm(false);
      setRequestMessage("");
      // Hiển thị thông báo thành công
      alert("Your request has been sent successfully!");
    } catch (err) {
      setError("Failed to send request");
      console.error("Error sending request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search and Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center text-sm whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Group
            </button>
            <button
              onClick={() => setIsRouteModalOpen(true)}
              className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center text-sm whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Create New Route
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="relative h-48 rounded-lg overflow-hidden mb-4">
            <img
              src="https://web-assets.strava.com/assets/landing-pages/_next/static/media/ALP-stories-cycling-1@2x.6913c47e.webp"
              alt="Cycling Community"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h1 className="text-white text-3xl font-semibold">
                Are you looking for community?
              </h1>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Bicycles: help bring us together
          </h2>
        </div>

        {/* Groups Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4"></div>
          ) : error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center p-4">
                  <div className="w-32 h-24 flex-shrink-0">
                    <img
                      src={group.image}
                      alt={group.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-800">
                        {group.title}
                      </h3>
                      {group.isPrivate && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600">
                        {group.members} members
                      </span>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="ml-auto bg-red-500 text-white px-4 py-1 rounded-full text-sm hover:bg-red-600 transition-colors duration-300"
                      >
                        {group.isPrivate ? "Request Access" : "Join"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Create New Group</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Route Modal Form */}
        {isRouteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Create Route</h2>
                <button
                  onClick={() => setIsRouteModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRouteSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Location
                    </label>
                    <input
                      type="text"
                      name="startLocation"
                      value={routeData.startLocation}
                      onChange={handleRouteInputChange}
                      placeholder="Q9"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      name="estimatedTime"
                      value={routeData.estimatedTime}
                      onChange={handleRouteInputChange}
                      placeholder="3 hours"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Location
                    </label>
                    <input
                      type="text"
                      name="endLocation"
                      value={routeData.endLocation}
                      onChange={handleRouteInputChange}
                      placeholder="Q1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Share
                    </label>
                    <select
                      name="share"
                      value={routeData.share}
                      onChange={handleRouteInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance
                    </label>
                    <input
                      type="text"
                      name="distance"
                      value={routeData.distance}
                      onChange={handleRouteInputChange}
                      placeholder="30km"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={routeData.description}
                      onChange={handleRouteInputChange}
                      placeholder="Chill"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsRouteModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request Access Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Request Access</h2>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you want to join this group?
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Tell us why you'd like to join..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
    </div>
    
  );
};

export default GroupPage;
