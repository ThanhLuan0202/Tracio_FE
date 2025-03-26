import React, { useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import RouteMap from './RouteMap';

const RouteForm = ({ initialData, onSubmit, onCancel }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    startLocation: '',
    endLocation: '',
    distance: '',
    estimatedTime: '',
    isPublic: false,
    description: '',
    startCoords: null,
    endCoords: null,
  });

  const [startAutocomplete, setStartAutocomplete] = useState(null);
  const [endAutocomplete, setEndAutocomplete] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const onStartPlaceChanged = () => {
    if (startAutocomplete) {
      const place = startAutocomplete.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({
          ...prev,
          startLocation: place.formatted_address,
          startCoords: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
      }
    }
  };

  const onEndPlaceChanged = () => {
    if (endAutocomplete) {
      const place = endAutocomplete.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({
          ...prev,
          endLocation: place.formatted_address,
          endCoords: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
      }
    }
  };

  const handleRouteCalculated = (routeInfo) => {
    setFormData(prev => ({
      ...prev,
      distance: routeInfo.distance,
      estimatedTime: routeInfo.duration,
      startCoords: routeInfo.startCoords,
      endCoords: routeInfo.endCoords,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.startCoords || !formData.endCoords) {
      alert('Vui lòng chọn điểm đầu và điểm cuối trên bản đồ');
      return;
    }
    if (isEditing && initialData) {
      onSubmit({ ...formData, id: initialData.id, createdAt: initialData.createdAt });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-white mb-1">Điểm xuất phát</label>
          <Autocomplete
            onLoad={setStartAutocomplete}
            onPlaceChanged={onStartPlaceChanged}
            restrictions={{ country: 'vn' }}
          >
            <input
              type="text"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              placeholder="Nhập địa điểm xuất phát"
              className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
              required
            />
          </Autocomplete>
        </div>

        <div className="form-group">
          <label className="block text-white mb-1">Điểm đến</label>
          <Autocomplete
            onLoad={setEndAutocomplete}
            onPlaceChanged={onEndPlaceChanged}
            restrictions={{ country: 'vn' }}
          >
            <input
              type="text"
              name="endLocation"
              value={formData.endLocation}
              onChange={handleChange}
              placeholder="Nhập địa điểm đến"
              className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
              required
            />
          </Autocomplete>
        </div>
      </div>

      {/* Map Component */}
      <div className="form-group">
        <label className="block text-white mb-1">Bản đồ</label>
        <RouteMap
          startLocation={formData.startLocation}
          endLocation={formData.endLocation}
          onRouteCalculated={handleRouteCalculated}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-white mb-1">Khoảng cách</label>
          <input
            type="text"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            placeholder="Ví dụ: 10 km"
            className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-white mb-1">Thời gian ước tính</label>
          <input
            type="text"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleChange}
            placeholder="Ví dụ: 2 giờ"
            className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="block text-white mb-1">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả chi tiết về lộ trình"
          className="w-full p-2 bg-white border border-zinc-700 rounded text-black min-h-[100px]"
        />
      </div>

      <div className="form-group p-4 border border-zinc-700 rounded bg-white">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="mt-1"
          />
          <div>
            <label htmlFor="isPublic" className="block">Chia sẻ công khai</label>
            <p className="text-gray-400 text-sm">Nếu được chọn, lộ trình này sẽ được chia sẻ công khai</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-zinc-700 text-white rounded hover:bg-zinc-800"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
        >
          {isEditing ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default RouteForm;