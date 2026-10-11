import React, { useState } from 'react';
import {
  GitCompare,
  Search,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { searchCities, POPULAR_CITIES } from '../services/weatherService';
import type { GeoLocation } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatSpeed } from '../utils/weatherUtils';

export const CompareCities: React.FC = () => {
  const {
    weatherData,
    comparison,
    runCityComparison,
    loadCity,
    units,
  } = useWeather();

  const [city1, setCity1] = useState<GeoLocation>(
    weatherData?.location || POPULAR_CITIES[0]
  );
  const [city2, setCity2] = useState<GeoLocation>(POPULAR_CITIES[1]);
  const [searchQuery2, setSearchQuery2] = useState('');
  const [searchResults2, setSearchResults2] = useState<GeoLocation[]>([]);

  const handleSearchCity2 = async (val: string) => {
    setSearchQuery2(val);
    if (val.trim().length < 2) {
      setSearchResults2([]);
      return;
    }
    try {
      const res = await searchCities(val);
      setSearchResults2(res);
    } catch {
      setSearchResults2([]);
    }
  };

  // Run on mount or city select
  React.useEffect(() => {
    runCityComparison(city1, city2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city1, city2]);

  const data1 = comparison.city1;
  const data2 = comparison.city2;

  // AI Verdict computation
  const getComparisonVerdict = () => {
    if (!data1 || !data2) return null;

    let score1 = 0;
    let score2 = 0;

    // Rain factor
    if (data1.current.rainChance < data2.current.rainChance) score1 += 2;
    else if (data2.current.rainChance < data1.current.rainChance) score2 += 2;

    // Temperature comfort (optimal 20-25C)
    const dist1 = Math.abs(data1.current.temp - 22);
    const dist2 = Math.abs(data2.current.temp - 22);
    if (dist1 < dist2) score1 += 2;
    else score2 += 2;

    // AQI factor (lower is better)
    if (data1.airQuality.aqi < data2.airQuality.aqi) score1 += 1.5;
    else score2 += 1.5;

    // Wind factor
    if (data1.current.windSpeed < data2.current.windSpeed) score1 += 1;
    else score2 += 1;

    const winner = score1 >= score2 ? data1 : data2;
    const loser = score1 >= score2 ? data2 : data1;

    return {
      winnerName: winner.location.name,
      loserName: loser.location.name,
      tempDiff: Math.abs(data1.current.temp - data2.current.temp),
      rainDiff: Math.abs(data1.current.rainChance - data2.current.rainChance),
      message: `${winner.location.name} currently offers more comfortable conditions with pleasant temperatures (${winner.current.temp}°C vs ${loser.current.temp}°C) and ${
        winner.current.rainChance < loser.current.rainChance
          ? `a much lower chance of rain (${winner.current.rainChance}% vs ${loser.current.rainChance}%)`
          : `cleaner air quality (AQI ${winner.airQuality.aqi})`
      }.`,
    };
  };

  const verdict = getComparisonVerdict();

  return (
    <div className="space-y-4">
      {/* Header and City Selectors */}
      <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">Compare Weather Across Cities</h3>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400">Side-by-Side Live Analysis</span>
        </div>

        {/* City Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* City 1 Selector */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-white/5 space-y-1.5 min-w-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              City 1 (Baseline)
            </label>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-extrabold text-white truncate">{city1.name}</span>
              <span className="text-xs text-sky-400 truncate ml-2">{city1.country}</span>
            </div>
            {/* Quick favorites/popular buttons */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {POPULAR_CITIES.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCity1(c)}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                    city1.name === c.name
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* City 2 Selector with search */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-white/5 space-y-1.5 relative min-w-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              City 2 (Comparison)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery2}
                onChange={(e) => handleSearchCity2(e.target.value)}
                placeholder={`Current: ${city2.name}. Search to change...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-400 outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* City 2 search dropdown */}
            {searchResults2.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-800">
                {searchResults2.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCity2(c);
                      setSearchResults2([]);
                      setSearchQuery2('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-sky-600/20 flex items-center justify-between text-xs text-white"
                  >
                    <span>{c.name}, {c.country}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Select</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_CITIES.slice(4, 8).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCity2(c)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                    city2.name === c.name
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Comparison Verdict */}
      {verdict && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900/60 border border-sky-500/30 shadow-xl flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/30 flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                WeatherAI Verdict
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {verdict.winnerName} Recommended
              </span>
            </div>
            <p className="text-sm text-slate-100 font-medium leading-relaxed">
              {verdict.message}
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      {comparison.loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
          <p className="text-sm">Fetching and synchronizing comparative weather data...</p>
        </div>
      ) : data1 && data2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {/* City 1 Card */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl card-glass border border-white/10 shadow-xl space-y-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-extrabold text-white truncate">{data1.location.name}</h4>
                <p className="text-[11px] text-slate-400">{data1.location.country}</p>
              </div>
              <button
                onClick={() => loadCity(data1.location)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30"
              >
                Set Active
              </button>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="p-2 rounded-xl bg-white/5 flex-shrink-0">
                <WeatherIcon icon={data1.current.icon} size={38} />
              </div>
              <div>
                <span className="text-3xl font-black text-white font-mono">
                  {formatTemp(data1.current.temp, units.tempUnit)}
                </span>
                <p className="text-xs font-bold text-slate-300 capitalize">
                  {data1.current.condition}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Rain Risk</span>
                <span className="text-xs sm:text-sm font-bold text-sky-400">{data1.current.rainChance}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Humidity</span>
                <span className="text-xs sm:text-sm font-bold text-white">{data1.current.humidity}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Wind</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  {formatSpeed(data1.current.windSpeed, units.speedUnit)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Air Quality</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">AQI {data1.airQuality.aqi}</span>
              </div>
            </div>
          </div>

          {/* City 2 Card */}
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl card-glass border border-white/10 shadow-xl space-y-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-extrabold text-white truncate">{data2.location.name}</h4>
                <p className="text-[11px] text-slate-400">{data2.location.country}</p>
              </div>
              <button
                onClick={() => loadCity(data2.location)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30"
              >
                Set Active
              </button>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="p-2 rounded-xl bg-white/5 flex-shrink-0">
                <WeatherIcon icon={data2.current.icon} size={38} />
              </div>
              <div>
                <span className="text-3xl font-black text-white font-mono">
                  {formatTemp(data2.current.temp, units.tempUnit)}
                </span>
                <p className="text-xs font-bold text-slate-300 capitalize">
                  {data2.current.condition}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Rain Risk</span>
                <span className="text-xs sm:text-sm font-bold text-sky-400">{data2.current.rainChance}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Humidity</span>
                <span className="text-xs sm:text-sm font-bold text-white">{data2.current.humidity}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Wind</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  {formatSpeed(data2.current.windSpeed, units.speedUnit)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 min-w-0">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Air Quality</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">AQI {data2.airQuality.aqi}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
