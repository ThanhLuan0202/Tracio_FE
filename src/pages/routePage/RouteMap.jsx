import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const RouteMap = ({ startLocation, endLocation, checkpoints = [], onRouteCalculated, onCheckpointAdd }) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const vectorLayerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastRouteRef = useRef(null);

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
          // Extract meaningful location name in English
          const name = location.address?.amenity || 
                      location.address?.building ||
                      location.address?.road ||
                      location.address?.suburb ||
                      location.address?.city_district ||
                      location.address?.city ||
                      'Checkpoint';
          
          onCheckpointAdd({
            name: name,
            location: location.display_name,
            coords: {
              lat: location.lat,
              lng: location.lon
            },
            address: location.address
          });
        }
      } catch (error) {
        console.error('Error adding checkpoint:', error);
        setError('Không thể thêm điểm dừng tại vị trí này');
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

  useEffect(() => {
    if (!map || !startLocation || !endLocation) return;

    const calculateRoute = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Check if the route is the same as before
      const routeKey = `${startLocation}-${endLocation}-${checkpoints.map(cp => cp.location).join('-')}`;
      if (routeKey === lastRouteRef.current) {
        return;
      }
      lastRouteRef.current = routeKey;

      setIsLoading(true);
      setError(null);

      try {
        // Get coordinates for all points
        const [startCoords, endCoords] = await Promise.all([
          geocodingService.geocode(startLocation),
          geocodingService.geocode(endLocation)
        ]);

        // Calculate route
        const routeData = await geocodingService.calculateRoute(startCoords, endCoords);

        // Create vector source and layer
        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          zIndex: 1 // Ensure markers are above the route line
        });

        // Add route line
        const routeFeature = new Feature({
          geometry: new LineString(routeData.routes[0].geometry.coordinates.map(coord => fromLonLat(coord)))
        });

        // Route style with gradient effect
        routeFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#3b82f6',
            width: 6,
            lineDash: [],
            lineCap: 'round',
            lineJoin: 'round'
          })
        }));

        // Add markers
        const startFeature = new Feature({
          geometry: new Point(fromLonLat(startCoords))
        });
        const endFeature = new Feature({
          geometry: new Point(fromLonLat(endCoords))
        });

        startFeature.setStyle(createMarkerStyle('start'));
        endFeature.setStyle(createMarkerStyle('end'));

        // Add features to source
        const features = [routeFeature, startFeature, endFeature];

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
          features.push(...checkpointFeatures);
        }

        vectorSource.addFeatures(features);

        // Update map layers
        if (vectorLayerRef.current) {
          map.removeLayer(vectorLayerRef.current);
        }
        map.addLayer(vectorLayer);
        vectorLayerRef.current = vectorLayer;

        // Only fit view when route changes
        const extent = vectorSource.getExtent();
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 500,
          maxZoom: 16 // Limit maximum zoom when fitting
        });

        // Calculate and return route info
        const distance = routeData.routes[0].distance / 1000;
        const totalMinutes = Math.round(routeData.routes[0].duration / 60);
        
        // Format duration
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
    };

    // Debounce the route calculation
    const timeoutId = setTimeout(calculateRoute, 500);
    return () => clearTimeout(timeoutId);

  }, [map, startLocation, endLocation, checkpoints, onRouteCalculated]);

  return (
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
  );
};

export default RouteMap; 