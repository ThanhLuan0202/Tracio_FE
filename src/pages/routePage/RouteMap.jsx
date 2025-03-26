import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 10.8231,  // Ho Chi Minh City coordinates
  lng: 106.6297
};

const defaultOptions = {
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
};

const RouteMap = ({ startLocation, endLocation, onRouteCalculated }) => {
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setDirectionsResponse(null);
  }, []);

  useEffect(() => {
    if (!map || !startLocation || !endLocation) return;

    const calculateRoute = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const directionsService = new window.google.maps.DirectionsService();
        const results = await directionsService.route({
          origin: startLocation,
          destination: endLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        setDirectionsResponse(results);
        
        // Extract route information
        const route = results.routes[0];
        const leg = route.legs[0];
        onRouteCalculated({
          distance: leg.distance.text,
          duration: leg.duration.text,
          startCoords: {
            lat: leg.start_location.lat(),
            lng: leg.start_location.lng()
          },
          endCoords: {
            lat: leg.end_location.lat(),
            lng: leg.end_location.lng()
          }
        });
      } catch (err) {
        console.error('Error calculating route:', err);
        setError('Could not calculate route. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    calculateRoute();
  }, [map, startLocation, endLocation, onRouteCalculated]);

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
      >
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#2563eb', // Blue color
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg text-red-600">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap; 