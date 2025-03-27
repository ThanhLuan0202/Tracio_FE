const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const REQUEST_TIMEOUT = 10000; // Reduced to 10 seconds

// Update proxy list with more reliable options
const PROXY_URLS = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

const OSRM_SERVERS = [
  'https://router.project-osrm.org',
  'https://routing.openstreetmap.de'
];

// Add route cache
const ROUTE_CACHE_SIZE = 50; // Maximum number of routes to cache

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
    this.currentProxyIndex = 0;
    this.currentOsrmIndex = 0;
    this.routeCache = new Map(); // Cache for routes
    this.coordinateCache = new Map(); // Cache for coordinates
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

      // Load route cache from localStorage
      const routeCache = localStorage.getItem('route_cache');
      if (routeCache) {
        const parsedCache = JSON.parse(routeCache);
        this.routeCache = new Map(parsedCache);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
      this.cache = {};
      this.routeCache = new Map();
    }
  }

  saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
      
      // Save route cache
      const routeCacheArray = Array.from(this.routeCache.entries());
      localStorage.setItem('route_cache', JSON.stringify(routeCacheArray));
    } catch (error) {
      console.error('Error saving cache:', error);
      if (error.name === 'QuotaExceededError') {
        // Clear old entries if storage is full
        this.clearOldCache();
      }
    }
  }

  clearOldCache() {
    // Clear old location cache
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > CACHE_EXPIRY / 2) {
        delete this.cache[key];
      }
    });

    // Clear old route cache
    if (this.routeCache.size > ROUTE_CACHE_SIZE) {
      const entries = Array.from(this.routeCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const toKeep = entries.slice(0, ROUTE_CACHE_SIZE);
      this.routeCache = new Map(toKeep);
    }

    this.saveCache();
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
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        // Add timestamp to URL to prevent caching
        const timestamp = Date.now();
        const urlWithTimestamp = url.includes('?') ? 
          `${url}&_t=${timestamp}` : 
          `${url}?_t=${timestamp}`;

        // Special handling for different proxy formats
        const finalUrl = proxyUrl.includes('?') ? 
          `${proxyUrl}${encodeURIComponent(urlWithTimestamp)}` : 
          `${proxyUrl}${urlWithTimestamp}`;

        const response = await fetch(finalUrl, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Accept': 'application/json',
            'User-Agent': 'Tracio App (https://tracio.app)',
            'Origin': window.location.origin
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
        
        // Try next proxy
        this.currentProxyIndex = (this.currentProxyIndex + 1) % PROXY_URLS.length;
        
        lastError = error instanceof GeocodingError ? error :
          new GeocodingError(
            'Network request failed',
            error.name === 'AbortError' ? 'timeout' : 'network',
            error
          );
        
        // Add delay between retries
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    // Check coordinate cache first
    if (this.coordinateCache.has(cacheKey)) {
      return this.coordinateCache.get(cacheKey);
    }
    
    // Then check localStorage cache
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < CACHE_EXPIRY) {
      return this.cache[cacheKey].results;
    }

    try {
      const data = await this.fetchWithRetry(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5`,
        {
          headers: {
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
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
        address: item.address || {}
      }));

      // Cache in memory and localStorage
      this.coordinateCache.set(cacheKey, results);
      this.cache[cacheKey] = {
        results,
        timestamp: Date.now()
      };
      this.saveCache();

      return results;
    } catch (error) {
      console.error('Location search error:', error);
      throw error;
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

  async calculateRoute(startCoords, endCoords, options = {}) {
    if (!startCoords || !endCoords) {
      throw new GeocodingError('Invalid coordinates', 'validation');
    }

    const [startLon, startLat] = Array.isArray(startCoords) ? startCoords : [startCoords.lng, startCoords.lat];
    const [endLon, endLat] = Array.isArray(endCoords) ? endCoords : [endCoords.lng, endCoords.lat];

    // Create cache key for the route
    const cacheKey = `route:${startLon},${startLat}-${endLon},${endLat}`;
    
    // Check route cache
    if (this.routeCache.has(cacheKey)) {
      const cachedRoute = this.routeCache.get(cacheKey);
      if (Date.now() - cachedRoute.timestamp < CACHE_EXPIRY) {
        return cachedRoute.data;
      }
    }

    // Construct the OSRM routing URL with alternatives
    const baseUrl = OSRM_SERVERS[this.currentOsrmIndex];
    const url = `${baseUrl}/route/v1/driving/${startLon},${startLat};${endLon},${endLat}`;
    
    // Add query parameters for alternatives and other options
    const queryParams = new URLSearchParams({
      alternatives: 'true',
      steps: 'true',
      annotations: 'true',
      geometries: 'geojson',
      overview: 'full'
    });

    try {
      const response = await this.fetchWithRetry(`${url}?${queryParams}`);
      
      if (!response.routes || response.routes.length === 0) {
        throw new GeocodingError('No route found', 'no_results');
      }

      // Cache the route
      this.routeCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      // Clean up old routes if cache is too large
      if (this.routeCache.size > ROUTE_CACHE_SIZE) {
        this.clearOldCache();
      }

      return response;
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw new GeocodingError(
        'Failed to calculate route',
        error instanceof GeocodingError ? error.type : 'unknown',
        error
      );
    }
  }
}

export const geocodingService = new GeocodingService(); 