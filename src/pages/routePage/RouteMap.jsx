import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform, transformExtent } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Icon, Stroke, Fill, Circle, Text } from 'ol/style';
import { getCenter } from 'ol/extent';
import { geocodingService } from '../../services/geocodingService';
import { debounce } from 'lodash';

const VIETNAM_EXTENT = transformExtent([102.14, 8.18, 109.46, 23.39], 'EPSG:4326', 'EPSG:3857');

// Custom marker styles
const createMarkerStyle = (type, index = null) => {
  if (type === 'start') {
    return new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: '#22c55e' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: 'S',
        fill: new Fill({ color: '#fff' }),
        font: 'bold 14px Arial',
        offsetY: 1
      })
    });
  } else if (type === 'end') {
    return new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: '#ef4444' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: 'E',
        fill: new Fill({ color: '#fff' }),
        font: 'bold 14px Arial',
        offsetY: 1
      })
    });
  } else {
    // Checkpoint style
    return new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: '#6366f1' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: index.toString(),
        fill: new Fill({ color: '#fff' }),
        font: 'bold 12px Arial',
        offsetY: 1
      })
    });
  }
};

// Route styles for different routes
const createRouteStyle = (isSelected, index) => {
  return new Style({
    stroke: new Stroke({
      color: isSelected ? '#3b82f6' : '#93c5fd',
      width: isSelected ? 6 : 4,
      lineDash: [],
      lineCap: 'round',
      lineJoin: 'round'
    })
  });
};

const RouteMap = React.memo(({ startLocation, endLocation, checkpoints = [], onRouteCalculated, onCheckpointAdd }) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const vectorLayerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastRouteRef = useRef(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const routeCalculationTimeoutRef = useRef(null);

  // Memoize the map instance creation
  const initializeMap = useCallback(() => {
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            crossOrigin: 'anonymous'
          })
        })
      ],
      view: new View({
        center: fromLonLat([106.6297, 10.8231]), // Ho Chi Minh City center
        zoom: 12,
        minZoom: 4,
        maxZoom: 19,
      })
    });

    // Add click handler for adding checkpoints
    mapInstanceRef.current.on('click', async (event) => {
      try {
        const coords = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
        const response = await geocodingService.searchLocations(`${coords[1]}, ${coords[0]}`);
        
        if (response && response.length > 0) {
          const location = response[0];
          
          // Extract meaningful location name in Vietnamese
          const name = location.address?.amenity || 
                      location.address?.building ||
                      location.address?.road ||
                      location.address?.suburb ||
                      location.address?.city_district ||
                      location.address?.city ||
                      'Điểm dừng';
          
          // Format address in Vietnamese
          const address = location.address;
          const formattedAddress = [
            address?.road,
            address?.suburb,
            address?.city_district,
            address?.city
          ].filter(Boolean).join(', ');
          
          onCheckpointAdd({
            name: name,
            location: formattedAddress || location.display_name,
            coords: {
              lat: location.lat,
              lng: location.lon
            },
            address: {
              road: address?.road,
              suburb: address?.suburb,
              city_district: address?.city_district,
              city: address?.city,
              state: address?.state,
              country: address?.country,
              postcode: address?.postcode
            }
          });
        } else {
          // If no location found, use coordinates as name
          onCheckpointAdd({
            name: 'Điểm dừng',
            location: `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`,
            coords: {
              lat: coords[1],
              lng: coords[0]
            },
            address: {
              road: null,
              suburb: null,
              city_district: null,
              city: null,
              state: null,
              country: null,
              postcode: null
            }
          });
        }
      } catch (error) {
        console.error('Error adding checkpoint:', error);
        setError('Không thể thêm điểm dừng tại vị trí này. Vui lòng thử lại.');
      }
    });

    setMap(mapInstanceRef.current);
  }, [onCheckpointAdd]);

  useEffect(() => {
    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initializeMap]);

  // Update the route calculation part
  const calculateRoute = useCallback(async (map, startLocation, endLocation, checkpoints) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const routeKey = `${startLocation}-${endLocation}-${checkpoints.map(cp => cp.location).join('-')}`;
    if (routeKey === lastRouteRef.current) {
      return;
    }
    lastRouteRef.current = routeKey;

    setIsLoading(true);
    setError(null);

    try {
      // Get coordinates for all points
      let startCoords, endCoords;
      
      if (typeof startLocation === 'object' && startLocation.lat && startLocation.lng) {
        startCoords = [startLocation.lng, startLocation.lat];
      } else if (typeof startLocation === 'string') {
        try {
          startCoords = await geocodingService.geocode(startLocation);
        } catch (error) {
          console.error('Error geocoding start location:', error);
          setError('Không thể tìm thấy điểm bắt đầu. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }
      } else {
        setError('Vui lòng nhập điểm bắt đầu hợp lệ');
        setIsLoading(false);
        return;
      }

      if (typeof endLocation === 'object' && endLocation.lat && endLocation.lng) {
        endCoords = [endLocation.lng, endLocation.lat];
      } else if (typeof endLocation === 'string') {
        try {
          endCoords = await geocodingService.geocode(endLocation);
        } catch (error) {
          console.error('Error geocoding end location:', error);
          setError('Không thể tìm thấy điểm kết thúc. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }
      } else {
        setError('Vui lòng nhập điểm kết thúc hợp lệ');
        setIsLoading(false);
        return;
      }

      // Validate coordinates
      if (!startCoords || !endCoords || 
          !Array.isArray(startCoords) || !Array.isArray(endCoords) ||
          startCoords.length !== 2 || endCoords.length !== 2) {
        setError('Không thể xác định tọa độ cho các điểm. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      // Calculate route with retries
      let routeData;
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          routeData = await geocodingService.calculateRoute(startCoords, endCoords, {
            alternatives: true,
            number_of_alternatives: 2,
            profile: 'driving',
            geometries: 'geojson',
            steps: true,
            overview: 'full',
            continue_straight: false,
            exclude: 'ferry'
          });
          
          if (routeData && routeData.routes && routeData.routes.length > 0) {
            break;
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Route calculation attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!routeData || !routeData.routes || routeData.routes.length === 0) {
        throw new Error('Không tìm thấy tuyến đường phù hợp');
      }

      const routes = routeData.routes;

      // Create vector source and layer
      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        zIndex: 1
      });

      // Add all route lines
      routes.forEach((route, index) => {
        const routeFeature = new Feature({
          geometry: new LineString(route.geometry.coordinates.map(coord => fromLonLat(coord))),
          properties: {
            index: index,
            distance: route.distance,
            duration: route.duration
          }
        });

        const style = createRouteStyle(index === selectedRouteIndex, index);
        routeFeature.setStyle(style);
        vectorSource.addFeature(routeFeature);
      });

      // Add markers
      const startFeature = new Feature({
        geometry: new Point(fromLonLat(startCoords))
      });
      const endFeature = new Feature({
        geometry: new Point(fromLonLat(endCoords))
      });

      startFeature.setStyle(createMarkerStyle('start'));
      endFeature.setStyle(createMarkerStyle('end'));
      vectorSource.addFeatures([startFeature, endFeature]);

      // Add checkpoints if any
      if (checkpoints && checkpoints.length > 0) {
        const checkpointFeatures = await Promise.all(
          checkpoints.map(async (checkpoint, index) => {
            const coords = await geocodingService.geocode(checkpoint.location);
            const feature = new Feature({
              geometry: new Point(fromLonLat(coords))
            });
            feature.setStyle(createMarkerStyle('checkpoint', index + 1));
            return feature;
          })
        );
        vectorSource.addFeatures(checkpointFeatures);
      }

      // Update map layers
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
      }
      map.addLayer(vectorLayer);
      vectorLayerRef.current = vectorLayer;

      // Fit view
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 500,
        maxZoom: 16
      });

      // Store alternative routes data
      setAlternativeRoutes(routes.map((route, index) => ({
        index: index,
        distance: route.distance / 1000,
        duration: route.duration / 60,
        coordinates: route.geometry.coordinates,
        steps: route.legs[0].steps.map(step => ({
          type: step.maneuver.type === 'turn' ? 
            (step.maneuver.modifier === 'right' ? 'turn-right' : 'turn-left') : 
            'straight',
          instruction: step.maneuver.instruction,
          distance: step.distance / 1000,
          duration: step.duration / 60
        }))
      })));

      // Calculate and return selected route info
      const selectedRoute = routes[selectedRouteIndex];
      const distance = selectedRoute.distance / 1000;
      const totalMinutes = Math.round(selectedRoute.duration / 60);
      
      let duration;
      if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        duration = minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
      } else {
        duration = `${totalMinutes} phút`;
      }

      onRouteCalculated({
        distance: `${distance.toFixed(1)} km`,
        duration: duration,
        startCoords: {
          lat: startCoords[1],
          lng: startCoords[0]
        },
        endCoords: {
          lat: endCoords[1],
          lng: endCoords[0]
        }
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Route calculation aborted');
        return;
      }
      console.error('Error calculating route:', err);
      setError('Could not calculate route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRouteIndex, onRouteCalculated]);

  // Use debounce for route calculation
  const debouncedCalculateRoute = useMemo(
    () => debounce(calculateRoute, 500),
    [calculateRoute]
  );

  useEffect(() => {
    if (!map || !startLocation || !endLocation) return;

    // Clear previous timeout
    if (routeCalculationTimeoutRef.current) {
      clearTimeout(routeCalculationTimeoutRef.current);
    }

    // Set new timeout for route calculation
    routeCalculationTimeoutRef.current = setTimeout(() => {
      debouncedCalculateRoute(map, startLocation, endLocation, checkpoints);
    }, 500);

    return () => {
      if (routeCalculationTimeoutRef.current) {
        clearTimeout(routeCalculationTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [map, startLocation, endLocation, checkpoints, debouncedCalculateRoute]);

  // Memoize route selection handler
  const handleRouteSelect = useCallback((index) => {
    setSelectedRouteIndex(index);
    
    if (vectorLayerRef.current) {
      const features = vectorLayerRef.current.getSource().getFeatures();
      features.forEach(feature => {
        if (feature.getGeometry() instanceof LineString) {
          const routeIndex = feature.get('properties').index;
          feature.setStyle(createRouteStyle(routeIndex === index, routeIndex));
        }
      });
    }

    const selectedRoute = alternativeRoutes[index];
    if (!selectedRoute) return;

    const distance = selectedRoute.distance;
    const totalMinutes = Math.round(selectedRoute.duration);
    
    let duration;
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      duration = minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
    } else {
      duration = `${totalMinutes} phút`;
    }

    onRouteCalculated({
      distance: `${distance.toFixed(1)} km`,
      duration: duration,
      startCoords: null,
      endCoords: null
    });
  }, [alternativeRoutes, onRouteCalculated]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div ref={mapRef} className="w-full h-[400px] rounded-lg overflow-hidden"></div>

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

      {/* Alternative Routes List - Only render when needed */}
      {alternativeRoutes.length > 1 && !alternativeRoutes[1].isGenerated && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Các tuyến đường có thể</h3>
          <div className="space-y-4">
            {alternativeRoutes.slice(0, 2).map((route, index) => (
              <div
                key={index}
                className={`rounded-lg cursor-pointer transition-all ${
                  selectedRouteIndex === index
                    ? 'bg-blue-50 border border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => handleRouteSelect(index)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-[#3b82f6]' : 'bg-[#93c5fd]'
                      }`}></div>
                      <span className="font-medium">Tuyến {index + 1}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {route.distance.toFixed(1)} km • {Math.round(route.duration)} phút
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

RouteMap.displayName = 'RouteMap';

export default RouteMap; 