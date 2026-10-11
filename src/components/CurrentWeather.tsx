import React from 'react';
import {
  Droplets,
  Wind,
  Eye,
  Sun,
  Gauge,
  Sunrise,
  Sunset,
  Compass,
  CloudRain,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { WeatherIcon } from './WeatherIcon';
import {
  formatTemp,
  formatSpeed,
  formatTimeString,
  getWindDirection,
  getUVInfo,
  getAQIInfo,
} from '../utils/weatherUtils';

export const CurrentWeather: React.FC = () => {
  const { weatherData, units } = useWeather();

  if (!weatherData) return null;

  const { current, location, localTime, daily } = weatherData;
  const todayDaily = daily[0];
  const uvInfo = getUVInfo(current.uvIndex);
  const aqiInfo = getAQIInfo(current.aqi);
  const windDir = getWindDirection(current.windDirection);

  // Compute daytime progress for sunrise/sunset visual
  const getSunProgress = (): number => {
    try {
      const now = new Date();
      const [srH, srM] = current.sunrise.includes('T')
        ? [new Date(current.sunrise).getHours(), new Date(current.sunrise).getMinutes()]
        : current.sunrise.split(':').map(Number);
      const [ssH, ssM] = current.sunset.includes('T')
        ? [new Date(current.sunset).getHours(), new Date(current.sunset).getMinutes()]
        : current.sunset.split(':').map(Number);

      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const srMinutes = srH * 60 + srM;
      const ssMinutes = ssH * 60 + ssM;

      if (nowMinutes < srMinutes) return 0;
      if (nowMinutes > ssMinutes) return 100;
      return Math.round(((nowMinutes - srMinutes) / (ssMinutes - srMinutes)) * 100);
    } catch {
      return 50;
    }
  };

  const sunProgress = getSunProgress();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl transition-all w-full max-w-full min-w-0">
      {/* Background ambient decorative glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Location, Date & Local Time */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
              {location.name}
            </h1>
            {location.country && (
              <span className="text-[11px] sm:text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                {location.country}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span>Local Time: {localTime}</span>
          </p>
        </div>

        {/* Live Status Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* AQI Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full border text-[11px] sm:text-xs font-semibold backdrop-blur-md"
            style={{
              backgroundColor: aqiInfo.badgeBg,
              borderColor: `${aqiInfo.color}40`,
              color: aqiInfo.color,
            }}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>AQI {current.aqi} • {aqiInfo.level}</span>
          </div>

          {/* Condition Tag */}
          <div className="px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px] sm:text-xs font-semibold text-slate-200">
            {current.isDay ? '☀️ Day' : '🌙 Night'}
          </div>
        </div>
      </div>

      {/* Main Temperature & Weather Hero Banner */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center py-3 sm:py-4">
        {/* Left Hero: Giant Temp & Condition */}
        <div className="lg:col-span-6 flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="relative p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex items-center justify-center flex-shrink-0">
            <WeatherIcon icon={current.icon} size={50} />
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {formatTemp(current.temp, units.tempUnit).replace('°', '')}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-sky-400 ml-1">
                °{units.tempUnit}
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-100 capitalize mt-0.5 truncate">
              {current.condition}
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-300 mt-0.5 font-medium flex-wrap">
              <span>Feels like {formatTemp(current.feelsLike, units.tempUnit)}</span>
              <span>•</span>
              <span className="text-emerald-400">↑ {formatTemp(todayDaily?.tempMax ?? current.temp, units.tempUnit)}</span>
              <span className="text-sky-300">↓ {formatTemp(todayDaily?.tempMin ?? current.temp - 5, units.tempUnit)}</span>
            </div>
          </div>
        </div>

        {/* Right Hero: Dynamic Sunrise / Sunset Visual Tracker */}
        <div className="lg:col-span-6 p-3 sm:p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md min-w-0">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mb-1.5 font-medium gap-1">
            <div className="flex items-center gap-1 text-amber-400">
              <Sunrise className="w-3.5 h-3.5" />
              <span>Sunrise: {formatTimeString(current.sunrise, units.timeFormat)}</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-300">
              <Sunset className="w-3.5 h-3.5" />
              <span>Sunset: {formatTimeString(current.sunset, units.timeFormat)}</span>
            </div>
          </div>

          {/* Progress Sun Track */}
          <div className="relative w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${sunProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
            <span>Dawn</span>
            <span>Daylight {sunProgress}% Complete</span>
            <span>Dusk</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Weather Metrics (Humidity, Wind, UV, Pressure, Rain Chance, Visibility) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-2.5 pt-1.5 sm:pt-2">
        {/* Humidity */}
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all group min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white">{current.humidity}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Dew point: {formatTemp(current.dewPoint, units.tempUnit)}</p>
        </div>

        {/* Wind Speed & Compass Direction */}
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all group min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Wind</span>
            <Wind className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white truncate">{formatSpeed(current.windSpeed, units.speedUnit)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
            <Compass className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{windDir} ({current.windDirection}°)</span>
          </p>
        </div>

        {/* Rain Chance */}
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all group min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Precipitation</span>
            <CloudRain className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white">{current.rainChance}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{current.precipitation.toFixed(1)} mm vol</p>
        </div>

        {/* UV Index */}
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all group min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider">UV Index</span>
            <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-base sm:text-lg font-bold text-white">{current.uvIndex}</p>
            <span
              className="text-[10px] font-bold"
              style={{ color: uvInfo.color }}
            >
              {uvInfo.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{uvInfo.advice}</p>
        </div>

        {/* Visibility */}
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all group min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Visibility</span>
            <Eye className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white">{current.visibility} km</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {current.visibility >= 10 ? 'Clear horizon' : 'Hazy / mist'}
          </p>
        </div>

        {/* Pressure */}
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all group min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white truncate">{current.pressure} hPa</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {current.pressure >= 1013 ? 'High pressure' : 'Low pressure'}
          </p>
        </div>
      </div>
    </div>
  );
};
