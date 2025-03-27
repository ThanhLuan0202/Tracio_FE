const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const REQUEST_TIMEOUT = 20000; // 20 seconds
const PROXY_URLS = [
  'https://corsproxy.org/?',
  'https://cors.sh/?',
  'https://proxy.cors.sh/',
  'https://api.allorigins.win/raw?url='
];

const OSRM_SERVERS = [
  'https://routing.openstreetmap.de',
  'https://router.project-osrm.org'
];

class GeocodingError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'GeocodingError';
    this.type = type;
    this.originalError = originalError;
  }
}

class GeocodingService {
  constructor() {
    this.loadCache();
    this.pendingRequests = new Map();
    this.currentProxyIndex = 0;
    this.currentOsrmIndex = 0;
    this.proxyFailures = new Map();
  }

  loadCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      this.cache = cached ? JSON.parse(cached) : {};
      
      // Clean expired entries
      const now = Date.now();
      let hasExpired = false;
      
      Object.keys(this.cache).forEach(key => {
        if (now - this.cache[key].timestamp > CACHE_EXPIRY) {
          delete this.cache[key];
          hasExpired = true;
        }
      });
      
      if (hasExpired) {
        this.saveCache();
      }
    } catch (error) {
      console.error('Error loading geocoding cache:', error);
      this.cache = {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving geocoding cache:', error);
      if (error.name === 'QuotaExceededError') {
        // If storage is full, clear old entries
        const now = Date.now();
        Object.keys(this.cache).forEach(key => {
          if (now - this.cache[key].timestamp > CACHE_EXPIRY / 2) {
            delete this.cache[key];
          }
        });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
        } catch (e) {
          console.error('Still cannot save cache after clearing old entries:', e);
          this.cache = {}; // Reset cache if still can't save
        }
      }
    }
  }

  async fetchWithRetry(url, options = {}, retries = 3) {
    let lastError;
    
    // Try direct request first for OSRM
    if (url.includes('router.project-osrm.org') || url.includes('routing.openstreetmap.de')) {
      try {
        const baseUrl = url.includes('router.project-osrm.org') ? 
          OSRM_SERVERS[this.currentOsrmIndex] : 
          url.split('/')[0] + '//' + url.split('/')[2];
        
        const path = '/' + url.split('/').slice(3).join('/');
        const osrmUrl = baseUrl + path;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(osrmUrl, {
          ...options,
          mode: 'cors',
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Accept': 'application/json',
            'User-Agent': 'Tracio App (https://tracio.app)'
          }
        });

        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.warn('Direct OSRM request failed:', error);
        this.currentOsrmIndex = (this.currentOsrmIndex + 1) % OSRM_SERVERS.length;
      }
    }
    
    // If direct request fails or for other services, try with proxies
    for (let i = 0; i < retries; i++) {
      const proxyUrl = PROXY_URLS[this.currentProxyIndex];
      
      // Skip proxies that have failed recently
      if (this.proxyFailures.has(proxyUrl)) {
        const failureTime = this.proxyFailures.get(proxyUrl);
        if (Date.now() - failureTime < 300000) { // 5 minutes cooldown
          this.currentProxyIndex = (this.currentProxyIndex + 1) % PROXY_URLS.length;
          continue;
        }
        this.proxyFailures.delete(proxyUrl);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        // Special handling for different proxy formats
        const finalUrl = proxyUrl.includes('?') ? 
          `${proxyUrl}${encodeURIComponent(url)}` : 
          `${proxyUrl}${url}`;

        const response = await fetch(finalUrl, {
          ...options,
          signal: controller.signal,
          mode: 'cors',
          headers: {
            ...options.headers,
            'Accept': 'application/json',
            'User-Agent': 'Tracio App (https://tracio.app)',
            'x-requested-with': 'XMLHttpRequest'
          }
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new GeocodingError(
            `HTTP error! status: ${response.status}`,
            'http',
            { status: response.status }
          );
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed with proxy ${proxyUrl}:`, error);
        
        // Mark proxy as failed
        this.proxyFailures.set(proxyUrl, Date.now());
        
        // Try next proxy
        this.currentProxyIndex = (this.currentProxyIndex + 1) % PROXY_URLS.length;
        
        lastError = error instanceof GeocodingError ? error :
          new GeocodingError(
            'Network request failed',
            error.name === 'AbortError' ? 'timeout' : 'network',
            error
          );
        
        // Exponential backoff with jitter
        if (i < retries - 1) {
          const baseDelay = Math.min(1000 * Math.pow(2, i), 10000);
          const jitter = Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
        }
      }
    }
    
    throw lastError;
  }

  async searchLocations(query) {
    if (!query || typeof query !== 'string') {
      throw new GeocodingError('Invalid search query', 'validation');
    }

    const cacheKey = `search:${query.toLowerCase().trim()}`;
    
    // Return cached result if valid
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < CACHE_EXPIRY) {
      return this.cache[cacheKey].results;
    }

    // Check if there's a pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    try {
      const promise = (async () => {
        const data = await this.fetchWithRetry(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5`,
          {
            headers: {
              'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
              'User-Agent': 'Tracio App (https://tracio.app)'
            }
          }
        );

        if (!Array.isArray(data)) {
          throw new GeocodingError('Invalid response format', 'format');
        }

        const results = data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type,
          importance: item.importance,
          address: {
            road: item.address?.road,
            suburb: item.address?.suburb,
            city: item.address?.city,
            state: item.address?.state,
            country: item.address?.country
          }
        }));

        // Cache the results
        this.cache[cacheKey] = {
          results,
          timestamp: Date.now()
        };
        this.saveCache();

        return results;
      })();

      // Store the pending request
      this.pendingRequests.set(cacheKey, promise);

      const results = await promise;
      
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);

      return results;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      console.error('Location search error:', error);
      
      if (error instanceof GeocodingError) {
        throw error;
      }
      
      throw new GeocodingError(
        'Failed to search location',
        'unknown',
        error
      );
    }
  }

  async geocode(location) {
    if (typeof location === 'string') {
      const results = await this.searchLocations(location);
      if (!results || results.length === 0) {
        throw new Error(`Could not find location: ${location}`);
      }
      return [results[0].lon, results[0].lat];
    }
    return location; // If already coordinates
  }

  async calculateRoute(startCoords, endCoords) {
    // Validate coordinates
    if (!Array.isArray(startCoords) || startCoords.length !== 2 ||
        !Array.isArray(endCoords) || endCoords.length !== 2 ||
        !startCoords.every(coord => typeof coord === 'number') ||
        !endCoords.every(coord => typeof coord === 'number')) {
      throw new GeocodingError('Invalid coordinates format', 'validation');
    }

    const cacheKey = `route:${startCoords.join(',')}-${endCoords.join(',')}`;
    
    // Return cached result if valid
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < CACHE_EXPIRY) {
      return this.cache[cacheKey].route;
    }

    // Check if there's a pending request for this route
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    try {
      const promise = (async () => {
        // Try multiple routing services
        for (let i = 0; i < OSRM_SERVERS.length; i++) {
          try {
            const baseUrl = OSRM_SERVERS[i];
            const url = `${baseUrl}/routed-car/route/v1/driving/${startCoords.join(',')};${endCoords.join(',')}?overview=full&geometries=geojson&steps=true&annotations=true`;
            
            const data = await this.fetchWithRetry(url, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Tracio App (https://tracio.app)'
              }
            });

            if (!data || typeof data !== 'object') {
              throw new GeocodingError('Invalid response format', 'format');
            }

            if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
              throw new GeocodingError(
                data.message || 'Route calculation failed',
                'routing',
                { code: data.code, message: data.message }
              );
            }

            const route = data.routes[0];
            
            // Validate route data
            if (!route.geometry || !route.geometry.coordinates || 
                !Array.isArray(route.geometry.coordinates) || 
                route.geometry.coordinates.length === 0) {
              throw new GeocodingError('Invalid route geometry', 'format');
            }

            // Cache the result
            this.cache[cacheKey] = {
              route: data,
              timestamp: Date.now()
            };
            this.saveCache();

            return data;
          } catch (error) {
            console.warn(`Failed to fetch route from ${OSRM_SERVERS[i]}:`, error);
            if (i === OSRM_SERVERS.length - 1) {
              throw error; // Re-throw if all servers failed
            }
          }
        }
      })();

      // Store the pending request
      this.pendingRequests.set(cacheKey, promise);

      const result = await promise;
      
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);

      return result;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      console.error('Route calculation error:', error);
      
      if (error instanceof GeocodingError) {
        throw error;
      }
      
      throw new GeocodingError(
        'Failed to calculate route',
        'unknown',
        error
      );
    }
  }
}

export const geocodingService = new GeocodingService(); 