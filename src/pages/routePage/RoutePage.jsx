import React, { useState } from 'react';
import RouteForm from './RouteForm';
import RouteList from './RouteList';
import SearchBar from '../../components/SearchBar';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/Breadcumbs';

const RoutePage = () => {
  const [routes, setRoutes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Hàm tạo route mới
  const handleCreateRoute = (route) => {
    const newRoute = {
      ...route,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setRoutes([newRoute, ...routes]);
    setIsCreating(false);
  };

  // Hàm cập nhật route
  const handleUpdateRoute = (updatedRoute) => {
    setRoutes(routes.map(route => route.id === updatedRoute.id ? updatedRoute : route));
    setEditingRoute(null);
  };

  // Hàm xóa route
  const handleDeleteRoute = (id) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  return (
    <div>
      <SearchBar />
      <Breadcrumbs />
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Quản lý lộ trình</h1>
          
          {!isCreating && !editingRoute && (
            <button 
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-200" 
              onClick={() => setIsCreating(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Tạo lộ trình mới
            </button>
          )}
        </header>

        <main>
          {isCreating && (
            <div className="p-4 mb-8 bg-zinc-800 border border-zinc-800 rounded-md">
              <h2 className="text-xl font-semibold mb-4 text-white">Tạo lộ trình mới</h2>
              <RouteForm
                onSubmit={handleCreateRoute}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          )}

          {editingRoute && (
            <div className="p-4 mb-8 bg-zinc-900 border border-zinc-800 rounded-md">
              <h2 className="text-xl font-semibold mb-4 text-white">Chỉnh sửa lộ trình</h2>
              <RouteForm
                initialData={editingRoute}
                onSubmit={handleUpdateRoute}
                onCancel={() => setEditingRoute(null)}
              />
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Lịch sử lộ trình</h2>
            <RouteList
              routes={routes}
              onEdit={setEditingRoute}
              onDelete={handleDeleteRoute}
            />
          </div>
        </main>
      </div>

    </div>  
    <Footer />
    </div>
  );
};

export default RoutePage;