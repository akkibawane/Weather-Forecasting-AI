import React, { useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatSpeed } from '../utils/weatherUtils';

export const HourlyForecast: React.FC = () => {
  const { weatherData, units } = useWeather();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl relative overflow-hidden w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Hourly Forecast</h3>
          <span className="text-[10px] sm:text-xs text-slate-400 ml-1">Next 24 Hours</span>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Scroll backward"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Scroll forward"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent snap-x snap-mandatory w-full min-w-0"
        style={{ scrollbarWidth: 'thin' }}
      >
        {weatherData.hourly.map((item, index) => (
          <div
            key={`${item.rawTime}-${index}`}
            className={`flex-shrink-0 w-24 sm:w-26 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all text-center flex flex-col items-center justify-between snap-start ${
              item.isCurrentHour
                ? 'bg-gradient-to-b from-sky-500/25 to-indigo-600/25 border-sky-400/60 shadow-lg shadow-sky-500/20 scale-[1.02]'
                : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/5 hover:border-white/10'
            }`}
          >
            {/* Time */}
            <div className="mb-1.5">
              <span
                className={`text-[11px] sm:text-xs font-bold block ${
                  item.isCurrentHour ? 'text-sky-300 font-extrabold' : 'text-slate-300'
                }`}
              >
                {item.isCurrentHour ? 'Now' : item.time}
              </span>
              <span className="text-[9px] text-slate-500 capitalize block truncate max-w-[70px]">
                {item.condition}
              </span>
            </div>

            {/* Weather Icon */}
            <div className="my-1 p-1 rounded-lg bg-white/5 flex items-center justify-center">
              <WeatherIcon icon={item.icon} size={24} />
            </div>

            {/* Temperature */}
            <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 font-mono">
              {formatTemp(item.temp, units.tempUnit)}
            </p>

            {/* Rain Chance Bar */}
            <div className="mt-1.5 w-full pt-1.5 border-t border-white/5 space-y-1">
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-sky-400">
                <Droplets className="w-2.5 h-2.5 text-sky-400" />
                <span>{item.rainChance}%</span>
              </div>

              {/* Rain Probability Mini Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(5, item.rainChance))}%` }}
                />
              </div>

              {/* Wind Speed */}
              <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 truncate">
                <Wind className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{formatSpeed(item.windSpeed, units.speedUnit)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
