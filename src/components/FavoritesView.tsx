import React, { useEffect, useState } from 'react';
import {
  Star,
  MapPin,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import type { GeoLocation, WeatherData } from '../types/weather';
import { fetchWeatherData } from '../services/weatherService';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp } from '../utils/weatherUtils';

export const FavoritesView: React.FC = () => {
  const {
    favorites,
    toggleFavorite,
    loadCity,
    weatherData,
    units,
    setActiveTab,
  } = useWeather();

  const [cardsData, setCardsData] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(false);

  // Fetch summary preview for all favorite locations
  useEffect(() => {
    let isMounted = true;
    const loadFavs = async () => {
      setLoading(true);
      const results: Record<string, WeatherData> = {};
      await Promise.all(
        favorites.map(async (city) => {
          try {
            const key = `${city.latitude}_${city.longitude}`;
            const data = await fetchWeatherData(city.latitude, city.longitude, city.name, city.country);
            results[key] = data;
          } catch (e) {
            // ignore
          }
        })
      );
      if (isMounted) {
        setCardsData(results);
        setLoading(false);
      }
    };

    if (favorites.length > 0) {
      loadFavs();
    }
    return () => {
      isMounted = false;
    };
  }, [favorites]);

  const handleSelectCity = (city: GeoLocation) => {
    loadCity(city);
    setActiveTab('dashboard');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">Saved Favorite Cities</h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Quick-access dashboard for your monitored worldwide locations ({favorites.length} saved)
          </p>
        </div>

        {weatherData && (
          <button
            onClick={() => toggleFavorite(weatherData.location)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {weatherData.location.name}</span>
          </button>
        )}
      </div>

      {loading && Object.keys(cardsData).length === 0 ? (
        <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
          <p className="text-xs">Updating favorites live meteorological snapshots...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-10 text-center card-glass rounded-2xl sm:rounded-3xl border border-white/10 space-y-2.5">
          <Star className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No saved cities yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the star icon in the header when viewing any city to pin it to your favorites for instant access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {favorites.map((city) => {
            const key = `${city.latitude}_${city.longitude}`;
            const data = cardsData[key];

            return (
              <div
                key={key}
                className="p-3.5 sm:p-4 rounded-2xl card-glass border border-white/10 hover:border-sky-500/40 shadow-lg transition-all hover:scale-[1.01] flex flex-col justify-between group min-w-0 overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{city.name}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{city.country || city.admin1}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(city);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {data ? (
                    <div className="flex items-center justify-between py-2.5">
                      <div>
                        <span className="text-3xl font-black text-white font-mono">
                          {formatTemp(data.current.temp, units.tempUnit)}
                        </span>
                        <p className="text-xs font-semibold text-slate-300 capitalize mt-0.5 truncate">
                          {data.current.condition}
                        </p>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/5 flex-shrink-0">
                        <WeatherIcon icon={data.current.icon} size={34} />
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-500">
                      Syncing live data...
                    </div>
                  )}

                  {data && (
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-center text-[10px] sm:text-[11px]">
                      <div className="p-1 rounded-lg bg-slate-900/40">
                        <span className="text-slate-500 block text-[9px]">Rain</span>
                        <span className="font-bold text-sky-400">{data.current.rainChance}%</span>
                      </div>
                      <div className="p-1 rounded-lg bg-slate-900/40">
                        <span className="text-slate-500 block text-[9px]">Humidity</span>
                        <span className="font-bold text-slate-300">{data.current.humidity}%</span>
                      </div>
                      <div className="p-1 rounded-lg bg-slate-900/40">
                        <span className="text-slate-500 block text-[9px]">AQI</span>
                        <span className="font-bold text-emerald-400">{data.airQuality.aqi}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSelectCity(city)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Forecast</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
