import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Star,
  RefreshCw,
  Sparkles,
  Share2,
  Settings as SettingsIcon,
  X,
  History,
  Palette,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { searchCities } from '../services/weatherService';
import { THEME_LIST } from '../utils/themeConfig';
import type { GeoLocation } from '../types/weather';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenChat: () => void;
  onOpenTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenShare,
  onOpenChat,
  onOpenTheme,
}) => {
  const {
    weatherData,
    loading,
    themeMode,
    loadCity,
    detectCurrentLocation,
    refreshWeather,
    toggleFavorite,
    isFavorite,
    units,
    setUnits,
    recentSearches,
    clearRecentSearches,
  } = useWeather();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchCities(query);
        setSearchResults(results);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: GeoLocation) => {
    loadCity(city);
    setQuery('');
    setShowDropdown(false);
  };

  const isCurrentFav = weatherData
    ? isFavorite(weatherData.location.latitude, weatherData.location.longitude)
    : false;

  return (
    <header className="header-glass sticky top-0 z-40 px-2.5 sm:px-4 lg:px-6 py-2 transition-all duration-300 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={refreshWeather}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 border border-white/20 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-sky-300 via-indigo-200 to-white bg-clip-text text-transparent">
                  WeatherAI
                </span>
                <span className="px-1 py-0.2 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Pro
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium hidden lg:block">
                Smart Forecast & Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar with Geocoding autocomplete */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-1 sm:mx-2 min-w-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search city (e.g. Tokyo, London)..."
              className="w-full pl-8 sm:pl-9 pr-14 sm:pr-20 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700/60 focus:border-sky-500/80 outline-none transition-all shadow-inner backdrop-blur-md"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-11 sm:right-14 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={detectCurrentLocation}
              title="Detect my location"
              className="absolute right-1.5 px-2 py-0.5 sm:py-1 text-[11px] rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 flex items-center gap-1 transition-all"
            >
              <MapPin className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline font-medium">GPS</span>
            </button>
          </div>

          {/* Search Dropdown / Autocomplete Results */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Searching worldwide locations...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-800/60">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Search Results
                  </div>
                  {searchResults.map((city, idx) => (
                    <button
                      key={`${city.latitude}-${city.longitude}-${idx}`}
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-sky-600/15 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors">
                            {city.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {[city.admin1, city.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No cities found matching &quot;{query}&quot;. Try another spelling.
                </div>
              ) : (
                /* Recent Searches */
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3 h-3" /> Recent & Popular
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] text-slate-500 hover:text-slate-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-1">
                    {recentSearches.map((city, idx) => (
                      <button
                        key={`${city.name}-${idx}`}
                        onClick={() => handleSelectCity(city)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/30 transition-all flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{city.name}</span>
                        {city.country && (
                          <span className="text-[10px] text-slate-500">
                            ({city.country.substring(0, 2).toUpperCase()})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Favorite Toggle Button */}
          <button
            onClick={() => {
              if (weatherData) {
                toggleFavorite(weatherData.location);
              }
            }}
            title={isCurrentFav ? 'Remove from favorites' : 'Save to favorites'}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              isCurrentFav
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Star
              className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isCurrentFav ? 'fill-amber-400 text-amber-400' : ''}`}
            />
          </button>

          {/* Unit Toggle Switch: C / F */}
          <button
            onClick={() =>
              setUnits({ tempUnit: units.tempUnit === 'C' ? 'F' : 'C' })
            }
            title="Toggle Temperature Unit"
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-0.5 sm:gap-1"
          >
            <span className={units.tempUnit === 'C' ? 'text-sky-400 font-bold' : 'text-slate-400'}>
              °C
            </span>
            <span className="text-slate-500">/</span>
            <span className={units.tempUnit === 'F' ? 'text-sky-400 font-bold' : 'text-slate-400'}>
              °F
            </span>
          </button>

          {/* Quick AI Assistant Trigger (Hidden on xs mobile because BottomNav already has AI Chat) */}
          <button
            onClick={onOpenChat}
            className="hidden sm:flex relative px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            title="Open AI Weather Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI</span>
          </button>

          {/* Share Modal Trigger */}
          <button
            onClick={onOpenShare}
            title="Share weather forecast"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-all hidden md:flex"
          >
            <Share2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Refresh Data */}
          <button
            onClick={refreshWeather}
            disabled={loading}
            title="Refresh live forecast"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Background Theme Switcher Button */}
          {(() => {
            const currentTheme = THEME_LIST.find((t) => t.id === themeMode) || THEME_LIST[0];
            return (
              <button
                onClick={onOpenTheme}
                title={`Current Theme: ${currentTheme.name} (Click to change background theme)`}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group shadow-sm"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40 flex-shrink-0 shadow-sm transition-transform group-hover:scale-110"
                  style={{ background: currentTheme.previewGradient }}
                />
                <span className="hidden md:inline text-[11px] sm:text-xs font-semibold text-slate-300 group-hover:text-white">
                  Theme
                </span>
                <Palette className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
              </button>
            );
          })()}

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Application Settings"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-all"
          >
            <SettingsIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
