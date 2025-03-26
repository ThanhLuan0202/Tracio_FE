import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 10.762622,  // Default center (Ho Chi Minh City)
  lng: 106.660172
};

const RouteMap = ({ startLocation, endLocation, onRouteCalculated }) => {
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [error, setError] = useState(null);

  // Callback when map loads
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Callback when map unmounts
  const onUnmount = useCallback((map) => {
    setMap(null);
  }, []);

  // Calculate route when start and end locations change
  const calculateRoute = useCallback(() => {
    if (!startLocation || !endLocation) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: startLocation,
        destination: endLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirectionsResponse(result);
          // Calculate distance and duration
          const route = result.routes[0];
          const distance = route.legs[0].distance.text;
          const duration = route.legs[0].duration.text;
          
          // Pass route information back to parent component
          onRouteCalculated({
            distance,
            duration,
            startCoords: {
              lat: route.legs[0].start_location.lat(),
              lng: route.legs[0].start_location.lng()
            },
            endCoords: {
              lat: route.legs[0].end_location.lat(),
              lng: route.legs[0].end_location.lng()
            }
          });
          setError(null);
        } else {
          setError('Không thể tìm thấy đường đi giữa hai điểm này');
          setDirectionsResponse(null);
        }
      }
    );
  }, [startLocation, endLocation, onRouteCalculated]);

  // Effect to calculate route when locations change
  React.useEffect(() => {
    if (startLocation && endLocation) {
      calculateRoute();
    }
  }, [startLocation, endLocation, calculateRoute]);

  return (
    <div className="w-full">
        
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"> 
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </LoadScript>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default RouteMap; 