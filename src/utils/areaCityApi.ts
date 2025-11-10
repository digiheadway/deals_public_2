/**
 * Utility functions for fetching and caching area/city data from API
 */

const API_URL = 'https://prop.digiheadway.in/api/network-area.php';
const CACHE_KEY = 'propnetwork_area_city_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export interface CityAreaData {
  city: string;
  areas: string[];
}

export interface AreaCityResponse {
  cities: CityAreaData[];
}

interface CachedData {
  data: AreaCityResponse;
  timestamp: number;
}

/**
 * Get cached area/city data if it exists and is still valid
 */
function getCachedData(): AreaCityResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 1 day)
    if (now - parsed.timestamp < CACHE_EXPIRY_MS) {
      return parsed.data;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

/**
 * Save area/city data to cache with timestamp
 */
function setCachedData(data: AreaCityResponse): void {
  try {
    const cache: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache area/city data:', error);
  }
}

/**
 * Clear the area/city cache
 */
export function clearAreaCityCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear area/city cache:', error);
  }
}

/**
 * Fetch area/city data from API
 */
async function fetchAreaCityData(): Promise<AreaCityResponse> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: AreaCityResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch area/city data:', error);
    throw error;
  }
}

/**
 * Get area/city data - returns cached data if available, otherwise fetches from API
 * If fetch fails, returns cached data even if expired, or null if no cache exists
 */
export async function getAreaCityData(forceRefresh = false): Promise<AreaCityResponse | null> {
  // If not forcing refresh, check cache first
  if (!forceRefresh) {
    const cached = getCachedData();
    if (cached) {
      return cached;
    }
  }

  // Try to fetch fresh data
  try {
    const data = await fetchAreaCityData();
    setCachedData(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch area/city data, trying expired cache:', error);
    
    // If fetch fails, try to return expired cache as fallback
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        return parsed.data;
      }
    } catch {
      // Ignore cache read errors
    }
    
    return null;
  }
}

/**
 * Get area/city data in background (non-blocking)
 * This will fetch and cache the data without blocking the UI
 */
export function fetchAreaCityDataInBackground(): void {
  // Check if we already have valid cached data
  const cached = getCachedData();
  if (cached) {
    return; // Already have fresh data, no need to fetch
  }

  // Fetch in background without awaiting
  fetchAreaCityData()
    .then((data) => {
      setCachedData(data);
      console.log('Area/city data fetched and cached in background');
    })
    .catch((error) => {
      console.error('Background fetch of area/city data failed:', error);
    });
}

/**
 * Get all cities from cached or API data
 */
export async function getCities(): Promise<string[]> {
  const data = await getAreaCityData();
  if (!data) return [];
  return data.cities.map((city) => city.city);
}

/**
 * Get areas for a specific city from cached or API data
 */
export async function getAreasForCity(city: string): Promise<string[]> {
  const data = await getAreaCityData();
  if (!data) return [];
  const cityData = data.cities.find((c) => c.city === city);
  return cityData ? cityData.areas : [];
}

/**
 * Get all areas from all cities (flattened list)
 */
export async function getAllAreas(): Promise<string[]> {
  const data = await getAreaCityData();
  if (!data) return [];
  const allAreas = data.cities.flatMap((city) => city.areas);
  // Remove duplicates and sort
  return Array.from(new Set(allAreas)).sort();
}

