import React, { useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places'];
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Lưu trữ trạng thái load script toàn cục
let isScriptLoaded = false;

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-800 rounded-lg">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-white text-sm">Đang tải bản đồ...</p>
  </div>
);

const ErrorDisplay = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-800 rounded-lg p-4">
    <div className="text-red-500 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <p className="text-white text-center mb-4">Không thể tải Google Maps</p>
    <p className="text-gray-400 text-sm text-center mb-4">
      Vui lòng kiểm tra kết nối mạng và API key
    </p>
    <button 
      onClick={onRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Thử lại
    </button>
  </div>
);

const GoogleMapsProvider = ({ children }) => {
  const [loadError, setLoadError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(isScriptLoaded);

  useEffect(() => {
    // Kiểm tra nếu script đã được load trước đó
    const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (script) {
      isScriptLoaded = true;
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    isScriptLoaded = true;
    setIsLoaded(true);
    setLoadError(null);
  };

  const handleError = (error) => {
    console.error('Google Maps loading error:', error);
    setLoadError(error);
    setIsLoaded(false);
    isScriptLoaded = false;
  };

  const handleRetry = () => {
    setLoadError(null);
    setIsLoaded(false);
    isScriptLoaded = false;
    
    // Xóa script cũ nếu có
    const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (script) {
      script.remove();
    }
  };

  if (loadError) {
    return <ErrorDisplay onRetry={handleRetry} />;
  }

  // Nếu script đã được load trước đó, render children ngay lập tức
  if (isScriptLoaded) {
    return children;
  }

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
      onUnmount={() => {
        // Không reset isScriptLoaded khi unmount để tránh load lại
        console.log('Google Maps script unmounted but kept in cache');
      }}
    >
      {isLoaded ? children : <LoadingSpinner />}
    </LoadScript>
  );
};

export default GoogleMapsProvider; 