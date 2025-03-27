import React, { useState, useEffect, useCallback, useRef } from 'react';
import RouteMap from './RouteMap';
import debounce from 'lodash/debounce';
import { geocodingService } from '../../services/geocodingService';

const RouteForm = ({ initialData, onSubmit, onCancel }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    startLocation: initialData?.startLocation || '',
    endLocation: initialData?.endLocation || '',
    checkpoints: initialData?.checkpoints || [],
    isPublic: initialData?.isPublic || false,
    distance: initialData?.distance || '',
    estimatedTime: initialData?.estimatedTime || '',
    startCoords: initialData?.startCoords || null,
    endCoords: initialData?.endCoords || null,
    description: initialData?.description || ''
  });

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingEnd, setIsLoadingEnd] = useState(false);
  const [error, setError] = useState(null);
  const suggestionsCache = useRef({});
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [checkpointLocation, setCheckpointLocation] = useState('');
  const [checkpointSuggestions, setCheckpointSuggestions] = useState([]);
  const [isLoadingCheckpoint, setIsLoadingCheckpoint] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startInputRef.current && !startInputRef.current.contains(event.target)) {
        setShowStartSuggestions(false);
      }
      if (endInputRef.current && !endInputRef.current.contains(event.target)) {
        setShowEndSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query, isStart) => {
    const setLoading = isStart ? setIsLoadingStart : setIsLoadingEnd;
    const setSuggestions = isStart ? setStartSuggestions : setEndSuggestions;

    // Check cache first
    if (suggestionsCache.current[query]) {
      setSuggestions(suggestionsCache.current[query]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const suggestions = await geocodingService.searchLocations(query);
      
      // Cache the results
      suggestionsCache.current[query] = suggestions;
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Unable to fetch location suggestions. Please try again later.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of fetchSuggestions with longer delay
  const debouncedFetchSuggestions = useCallback(
    debounce((query, isStart) => {
      if (query.length > 2) {
        fetchSuggestions(query, isStart);
      } else {
        isStart ? setStartSuggestions([]) : setEndSuggestions([]);
      }
    }, 1000), // Increased debounce delay to 1 second
    []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Fetch suggestions when location input changes
    if (name === 'startLocation') {
      debouncedFetchSuggestions(value, true);
      setShowStartSuggestions(true);
    } else if (name === 'endLocation') {
      debouncedFetchSuggestions(value, false);
      setShowEndSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion, isStart) => {
    const location = suggestion.display_name;
    const coords = {
      lat: suggestion.lat,
      lng: suggestion.lon
    };

    setFormData(prev => ({
      ...prev,
      [isStart ? 'startLocation' : 'endLocation']: location,
      [isStart ? 'startCoords' : 'endCoords']: coords
    }));

    if (isStart) {
      setShowStartSuggestions(false);
      setStartSuggestions([]);
    } else {
      setShowEndSuggestions(false);
      setEndSuggestions([]);
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

  const handleCheckpointAdd = useCallback((checkpoint) => {
    setFormData(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, checkpoint]
    }));
  }, []);

  const handleCheckpointRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((_, i) => i !== index)
    }));
  };

  const handleCheckpointLocationChange = (e) => {
    const value = e.target.value;
    setCheckpointLocation(value);
    
    if (value.length > 2) {
      debouncedFetchSuggestions(value, 'checkpoint');
    } else {
      setCheckpointSuggestions([]);
    }
  };

  const handleCheckpointSuggestionClick = async (suggestion) => {
    const location = suggestion.display_name;
    const coords = {
      lat: suggestion.lat,
      lng: suggestion.lon
    };

    handleCheckpointAdd(coords);
    setShowCheckpointModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.startCoords || !formData.endCoords) {
      setError('Please select valid start and end locations');
      return;
    }
    if (isEditing && initialData) {
      onSubmit({ ...formData, id: initialData.id, createdAt: initialData.createdAt });
    } else {
      onSubmit(formData);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coords = [position.coords.longitude, position.coords.latitude];
          const suggestions = await geocodingService.searchLocations(`${position.coords.latitude}, ${position.coords.longitude}`);
          
          if (suggestions && suggestions.length > 0) {
            handleSuggestionClick(suggestions[0], true);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setError('Không thể lấy địa chỉ hiện tại');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Không thể lấy vị trí hiện tại');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group relative" ref={startInputRef}>
          <label className="block text-white mb-1">Start Location</label>
          <div className="relative flex">
            <input
              type="text"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              onFocus={() => setShowStartSuggestions(true)}
              placeholder="Enter start location"
              className="w-full p-2 bg-white border border-zinc-700 rounded-l text-black"
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-3 bg-purple-600 text-white border border-l-0 border-purple-600 rounded-r hover:bg-purple-700 flex items-center"
              disabled={isGettingLocation}
              title="Dùng vị trí hiện tại"
            >
              {isGettingLocation ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="1"/>
                  <line x1="12" y1="7" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="17"/>
                  <line x1="17" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="12" x2="7" y2="12"/>
                </svg>
              )}
            </button>
          </div>
          {showStartSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isLoadingStart ? (
                <div className="p-2 text-gray-500 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"></div>
                  <span className="ml-2">Searching...</span>
                </div>
              ) : error ? (
                <div className="p-2 text-red-500">{error}</div>
              ) : startSuggestions.length > 0 ? (
                startSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion, true)}
                  >
                    {suggestion.display_name}
                  </div>
                ))
              ) : formData.startLocation.length > 2 ? (
                <div className="p-2 text-gray-500">No suggestions found</div>
              ) : null}
            </div>
          )}
        </div>

        <div className="form-group relative" ref={endInputRef}>
          <label className="block text-white mb-1">End Location</label>
          <input
            type="text"
            name="endLocation"
            value={formData.endLocation}
            onChange={handleChange}
            onFocus={() => setShowEndSuggestions(true)}
            placeholder="Enter end location"
            className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
            required
          />
          {showEndSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isLoadingEnd ? (
                <div className="p-2 text-gray-500 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"></div>
                  <span className="ml-2">Searching...</span>
                </div>
              ) : error ? (
                <div className="p-2 text-red-500">{error}</div>
              ) : endSuggestions.length > 0 ? (
                endSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion, false)}
                  >
                    {suggestion.display_name}
                  </div>
                ))
              ) : formData.endLocation.length > 2 ? (
                <div className="p-2 text-gray-500">No suggestions found</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Map Component */}
      <div className="form-group">
        <label className="block text-white mb-1">Map</label>
        <RouteMap
          startLocation={formData.startLocation}
          endLocation={formData.endLocation}
          checkpoints={formData.checkpoints}
          onRouteCalculated={handleRouteCalculated}
          onCheckpointAdd={handleCheckpointAdd}
        />
      </div>

      {/* Display checkpoints */}
      {formData.checkpoints.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Checkpoints ({formData.checkpoints.length})
          </label>
          <div className="space-y-2">
            {formData.checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-center justify-between bg-zinc-800 p-2 rounded">
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-purple-600 text-white rounded-full mr-2">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-white font-medium">{checkpoint.name}</span>
                    <p className="text-gray-400 text-sm">{checkpoint.location}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCheckpointRemove(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            Click on the map to add checkpoints
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-white mb-1">Distance</label>
          <input
            type="text"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            placeholder="Example: 10 km"
            className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
            required
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="block text-white mb-1">Estimated Time</label>
          <input
            type="text"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleChange}
            placeholder="Example: 2 hours"
            className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
            required
            readOnly
          />
        </div>
      </div>

      <div className="form-group">
        <label className="block text-white mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed description of the route"
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
            <label htmlFor="isPublic" className="block">Share Publicly</label>
            <p className="text-gray-400 text-sm">If selected, this route will be shared publicly</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-zinc-700 text-white rounded hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          disabled={isLoadingStart || isLoadingEnd}
        >
          {isEditing ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Checkpoint Modal */}
      {showCheckpointModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-md max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Add Checkpoint</h3>
              <button
                onClick={() => setShowCheckpointModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={checkpointLocation}
                onChange={handleCheckpointLocationChange}
                placeholder="Enter checkpoint location"
                className="w-full p-2 bg-white border border-zinc-700 rounded text-black"
              />

              {checkpointSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isLoadingCheckpoint ? (
                    <div className="p-2 text-gray-500 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"/>
                      <span className="ml-2">Searching...</span>
                    </div>
                  ) : (
                    checkpointSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                        onClick={() => handleCheckpointSuggestionClick(suggestion)}
                      >
                        {suggestion.display_name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCheckpointModal(false)}
                className="px-4 py-2 border border-zinc-700 text-white rounded hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default RouteForm;