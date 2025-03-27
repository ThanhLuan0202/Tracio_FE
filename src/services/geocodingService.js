const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const PROXY_URLS = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

class GeocodingService {
  constructor() {
    this.loadCache();
    this.pendingRequests = new Map();
    this.currentProxyIndex = 0;
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
    
    for (let i = 0; i < retries; i++) {
      try {
        const proxyUrl = PROXY_URLS[this.currentProxyIndex];
        const response = await fetch(proxyUrl + encodeURIComponent(url), options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error;
        
        // Try next proxy
        this.currentProxyIndex = (this.currentProxyIndex + 1) % PROXY_URLS.length;
        
        // Wait before retry
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  async searchLocations(query) {
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
              'Accept-Language': 'vi-VN,vi',
              'User-Agent': 'Tracio App'
            }
          }
        );

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

  async calculateRoute(startCoords, endCoords) {
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
        const data = await this.fetchWithRetry(
          `https://router.project-osrm.org/route/v1/driving/${startCoords.join(',')};${endCoords.join(',')}?overview=full&geometries=geojson`
        );

        if (data.code !== 'Ok') {
          throw new Error('Could not calculate route');
        }

        // Cache the result
        this.cache[cacheKey] = {
          route: data,
          timestamp: Date.now()
        };
        this.saveCache();

        return data;
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
      throw error;
    }
  }
}

export const geocodingService = new GeocodingService(); 