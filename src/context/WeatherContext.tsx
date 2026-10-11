import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  WeatherData,
  GeoLocation,
  WeatherUnits,
  ThemeMode,
} from '../types/weather';
import {
  fetchWeatherData,
  reverseGeocode,
  POPULAR_CITIES,
} from '../services/weatherService';

export type ActiveTab =
  | 'dashboard'
  | 'forecast'
  | 'air-quality'
  | 'map'
  | 'favorites'
  | 'compare'
  | 'assistant'
  | 'settings';

interface WeatherContextType {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  selectedCity: GeoLocation;
  favorites: GeoLocation[];
  recentSearches: GeoLocation[];
  units: WeatherUnits;
  themeMode: ThemeMode;
  geminiApiKey: string;
  mapApiKey: string;
  activeTab: ActiveTab;
  comparison: {
    city1: WeatherData | null;
    city2: WeatherData | null;
    loading: boolean;
  };
  loadCity: (city: GeoLocation) => Promise<void>;
  detectCurrentLocation: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  toggleFavorite: (city: GeoLocation) => void;
  isFavorite: (lat: number, lon: number) => boolean;
  setUnits: (units: Partial<WeatherUnits>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setGeminiApiKey: (key: string) => void;
  setMapApiKey: (key: string) => void;
  runCityComparison: (city1: GeoLocation, city2: GeoLocation) => Promise<void>;
  clearRecentSearches: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const STORAGE_FAVORITES = 'weatherai_favorites';
const STORAGE_RECENTS = 'weatherai_recents';
const STORAGE_UNITS = 'weatherai_units';
const STORAGE_THEME = 'weatherai_theme';
const STORAGE_APIKEY = 'weatherai_gemini_key';
const STORAGE_MAP_KEY = 'weatherai_map_key';

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial default location: New York (or cached previous city)
  const [selectedCity, setSelectedCity] = useState<GeoLocation>(() => {
    try {
      const saved = localStorage.getItem('weatherai_last_city');
      return saved ? JSON.parse(saved) : POPULAR_CITIES[0];
    } catch {
      return POPULAR_CITIES[0];
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Favorites
  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES);
      return saved ? JSON.parse(saved) : POPULAR_CITIES.slice(0, 3);
    } catch {
      return POPULAR_CITIES.slice(0, 3);
    }
  });

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<GeoLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENTS);
      return saved ? JSON.parse(saved) : POPULAR_CITIES.slice(0, 4);
    } catch {
      return POPULAR_CITIES.slice(0, 4);
    }
  });

  // Units
  const [units, setUnitsState] = useState<WeatherUnits>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_UNITS);
      return saved ? JSON.parse(saved) : { tempUnit: 'C', speedUnit: 'km/h', timeFormat: '12h' };
    } catch {
      return { tempUnit: 'C', speedUnit: 'km/h', timeFormat: '12h' };
    }
  });

  // Theme
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME) as ThemeMode;
      if (saved && saved !== 'dark') return saved;
      return 'aurora';
    } catch {
      return 'aurora';
    }
  });

  // Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_APIKEY) || '';
    } catch {
      return '';
    }
  });

  // Map API Key (e.g. OpenWeatherMap)
  const [mapApiKey, setMapApiKey] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_MAP_KEY) ||
        (import.meta as any).env?.VITE_OPENWEATHER_API_KEY ||
        ''
      );
    } catch {
      return '';
    }
  });

  // Comparison State
  const [comparison, setComparison] = useState<{
    city1: WeatherData | null;
    city2: WeatherData | null;
    loading: boolean;
  }>({
    city1: null,
    city2: null,
    loading: false,
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECENTS, JSON.stringify(recentSearches));
    } catch {
      // ignore
    }
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_UNITS, JSON.stringify(units));
    } catch {
      // ignore
    }
  }, [units]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME, themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APIKEY, geminiApiKey);
    } catch {
      // ignore
    }
  }, [geminiApiKey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MAP_KEY, mapApiKey);
    } catch {
      // ignore
    }
  }, [mapApiKey]);

  // Load weather for a city
  const loadCity = useCallback(async (city: GeoLocation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(
        city.latitude,
        city.longitude,
        city.name,
        city.country,
        city.admin1
      );
      setWeatherData(data);
      setSelectedCity(city);
      try {
        localStorage.setItem('weatherai_last_city', JSON.stringify(city));
      } catch {
        // ignore
      }

      // Add to recent searches
      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (c) =>
            Math.abs(c.latitude - city.latitude) > 0.05 ||
            Math.abs(c.longitude - city.longitude) > 0.05
        );
        return [city, ...filtered].slice(0, 8);
      });
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError('Unable to load weather forecast for this location. Showing cached data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Detect location via Browser Geolocation API
  const detectCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocode(lat, lon);
          await loadCity(geo);
        } catch {
          setError('Could not identify current city name. Loading coordinates.');
          await loadCity({
            name: 'Local Weather',
            country: '',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. You can search any city in the search bar.');
        } else {
          setError('Unable to detect location. Please search for your city.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [loadCity]);

  // Refresh current city
  const refreshWeather = useCallback(async () => {
    if (selectedCity) {
      await loadCity(selectedCity);
    }
  }, [selectedCity, loadCity]);

  // Toggle Favorite
  const toggleFavorite = useCallback((city: GeoLocation) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) =>
          Math.abs(f.latitude - city.latitude) < 0.05 &&
          Math.abs(f.longitude - city.longitude) < 0.05
      );
      if (exists) {
        return prev.filter(
          (f) =>
            Math.abs(f.latitude - city.latitude) >= 0.05 ||
            Math.abs(f.longitude - city.longitude) >= 0.05
        );
      } else {
        return [...prev, city];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (lat: number, lon: number): boolean => {
      return favorites.some(
        (f) => Math.abs(f.latitude - lat) < 0.05 && Math.abs(f.longitude - lon) < 0.05
      );
    },
    [favorites]
  );

  const setUnits = useCallback((newUnits: Partial<WeatherUnits>) => {
    setUnitsState((prev) => ({ ...prev, ...newUnits }));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  // Run side-by-side comparison
  const runCityComparison = useCallback(
    async (city1: GeoLocation, city2: GeoLocation) => {
      setComparison((prev) => ({ ...prev, loading: true }));
      try {
        const [data1, data2] = await Promise.all([
          fetchWeatherData(city1.latitude, city1.longitude, city1.name, city1.country),
          fetchWeatherData(city2.latitude, city2.longitude, city2.name, city2.country),
        ]);
        setComparison({
          city1: data1,
          city2: data2,
          loading: false,
        });
      } catch (e) {
        console.error('Comparison fetch failed', e);
        setComparison((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_RECENTS);
  }, []);

  // Initial load
  useEffect(() => {
    loadCity(selectedCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        loading,
        error,
        selectedCity,
        favorites,
        recentSearches,
        units,
        themeMode,
        geminiApiKey,
        mapApiKey,
        activeTab,
        comparison,
        loadCity,
        detectCurrentLocation,
        refreshWeather,
        toggleFavorite,
        isFavorite,
        setUnits,
        setThemeMode,
        setActiveTab,
        setGeminiApiKey,
        setMapApiKey,
        runCityComparison,
        clearRecentSearches,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
