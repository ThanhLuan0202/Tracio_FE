import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const RouteList = ({ routes, onEdit, onDelete }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showCheckpointsModal, setShowCheckpointsModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  if (routes.length === 0) {
    return (
      <div className="text-center py-8 border border-zinc-800 rounded-md">
        <p className="text-gray-400">Chưa có lộ trình nào được tạo</p>
      </div>
    );
  }

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = (id) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleViewCheckpoints = (route) => {
    setSelectedRoute(route);
    setShowCheckpointsModal(true);
  };

  return (
    <div className="border border-zinc-800 rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white">
            <tr>
              <th className="text-left p-4 text-black">Lộ trình</th>
              <th className="text-left p-4 text-black">Khoảng cách</th>
              <th className="text-left p-4 text-black">Thời gian</th>
              <th className="text-left p-4 text-black">Chia sẻ</th>
              <th className="text-left p-4 text-black">Ngày tạo</th>
              <th className="text-right p-4 text-black">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t border-zinc-800">
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-black">{route.startLocation}</div>
                    <div className="text-gray-400 text-sm">đến {route.endLocation}</div>
                  </div>
                </td>
                <td className="p-4 text-black">{route.distance}</td>
                <td className="p-4 text-black">{route.estimatedTime}</td>
                <td className="p-4">
                  {route.isPublic ? (
                    <div className="flex items-center text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M2 12h20"></path>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      <span>Công khai</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Riêng tư</span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-gray-400">
                  {formatDistanceToNow(route.createdAt, { 
                    addSuffix: true,
                    locale: vi
                  })}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewCheckpoints(route)}
                      className="p-1 border border-purple-600 rounded hover:bg-purple-700 hover:text-white text-purple-600"
                      title="Xem điểm dừng"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(route)}
                      className="p-1 border border-zinc-700 rounded hover:bg-zinc-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(route.id)}
                      className="p-1 border border-zinc-700 rounded hover:bg-zinc-800 text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Checkpoints Modal */}
      {showCheckpointsModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-md max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Điểm dừng trên lộ trình
              </h3>
              <button
                onClick={() => setShowCheckpointsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-gray-400 mb-2">Lộ trình:</div>
              <div className="text-white">
                {selectedRoute.startLocation} → {selectedRoute.endLocation}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800 p-4 rounded">
                  <div className="text-gray-400 mb-2">Khoảng cách:</div>
                  <div className="text-white font-medium">{selectedRoute.distance}</div>
                </div>
                <div className="bg-zinc-800 p-4 rounded">
                  <div className="text-gray-400 mb-2">Thời gian:</div>
                  <div className="text-white font-medium">{selectedRoute.estimatedTime}</div>
                </div>
              </div>

              <div className="bg-zinc-800 p-4 rounded">
                <div className="text-gray-400 mb-2">Điểm dừng:</div>
                {selectedRoute.checkpoints && selectedRoute.checkpoints.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedRoute.checkpoints.map((checkpoint, index) => (
                      <li key={index} className="flex items-center text-white">
                        <span className="w-8 h-8 flex items-center justify-center bg-purple-600 rounded-full mr-3">
                          {index + 1}
                        </span>
                        {checkpoint.name || `Điểm dừng ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Chưa có điểm dừng nào được thêm</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCheckpointsModal(false)}
                className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-md max-w-md w-full">
            <h3 className="text-white text-lg font-semibold mb-2">Xác nhận xóa</h3>
            <p className="text-gray-400 mb-4">
              Bạn có chắc chắn muốn xóa lộ trình này?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-zinc-700 text-white rounded hover:bg-zinc-800"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteList;