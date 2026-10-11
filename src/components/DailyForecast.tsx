import React, { useState } from 'react';
import {
  CalendarDays,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatSpeed, formatTimeString } from '../utils/weatherUtils';

export const DailyForecast: React.FC = () => {
  const { weatherData, units } = useWeather();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!weatherData || !weatherData.daily || weatherData.daily.length === 0) {
    return null;
  }

  // Calculate the overall min and max temp across the 7 days to scale temperature range bars
  const allMins = weatherData.daily.map((d) => d.tempMin);
  const allMaxs = weatherData.daily.map((d) => d.tempMax);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempRange = Math.max(1, globalMax - globalMin);

  return (
    <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">7-Day Weather Forecast</h3>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Daily Highs & Lows</span>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {weatherData.daily.map((day) => {
          const isExpanded = expandedDate === day.date;
          // Percentage offset and width for the temperature bar
          const leftPercent = Math.max(0, ((day.tempMin - globalMin) / tempRange) * 100);
          const rightPercent = Math.min(100, ((day.tempMax - globalMin) / tempRange) * 100);
          const barWidth = Math.max(8, rightPercent - leftPercent);

          return (
            <div
              key={day.date}
              className={`rounded-xl sm:rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-800/70 border-sky-500/40 shadow-md'
                  : 'bg-slate-900/40 hover:bg-slate-800/50 border-white/5'
              }`}
            >
              {/* Row Summary */}
              <div
                onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                className="p-2.5 sm:p-3 flex items-center justify-between gap-1.5 sm:gap-3 cursor-pointer select-none min-w-0"
              >
                {/* Day name & date */}
                <div className="w-16 sm:w-22 md:w-24 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-white block truncate">
                    {day.dayName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400">
                    {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Weather Icon & Condition */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="p-1 rounded-lg bg-white/5 flex-shrink-0">
                    <WeatherIcon icon={day.icon} size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-200 truncate capitalize">
                    {day.condition}
                  </span>
                </div>

                {/* Rain probability */}
                <div className="w-11 sm:w-14 flex-shrink-0 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-sky-400">
                  {day.rainChance > 10 ? (
                    <>
                      <Droplets className="w-3 h-3" />
                      <span>{day.rainChance}%</span>
                    </>
                  ) : (
                    <span className="text-slate-500 text-[10px]">—</span>
                  )}
                </div>

                {/* Visual Temperature Bar on Desktop/Tablet */}
                <div className="hidden md:flex items-center gap-1.5 sm:gap-2 w-44 lg:w-56 min-w-0 flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 font-mono w-8 text-right truncate">
                    {formatTemp(day.tempMin, units.tempUnit)}
                  </span>

                  <div className="flex-1 h-1.5 sm:h-2 bg-slate-800/90 rounded-full relative overflow-hidden min-w-[40px]">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-amber-400 shadow-sm"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${barWidth}%`,
                      }}
                    />
                  </div>

                  <span className="text-[11px] font-extrabold text-white font-mono w-8 text-left truncate">
                    {formatTemp(day.tempMax, units.tempUnit)}
                  </span>
                </div>

                {/* Mobile temp preview */}
                <div className="flex md:hidden items-center gap-1 font-mono text-[11px] sm:text-xs flex-shrink-0">
                  <span className="text-slate-400">{formatTemp(day.tempMin, units.tempUnit)}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-white font-bold">{formatTemp(day.tempMax, units.tempUnit)}</span>
                </div>

                {/* Expand Chevron */}
                <div className="text-slate-400 hover:text-white pl-0.5 sm:pl-1 flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-[10px] uppercase font-bold">Max Wind</span>
                    </div>
                    <p className="font-bold text-white">
                      {formatSpeed(day.windSpeedMax, units.speedUnit)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] uppercase font-bold">Max UV</span>
                    </div>
                    <p className="font-bold text-white">Index {day.uvIndexMax}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] uppercase font-bold">Sunrise</span>
                    </div>
                    <p className="font-bold text-white">
                      {formatTimeString(day.sunrise, units.timeFormat)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Sunset className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] uppercase font-bold">Sunset</span>
                    </div>
                    <p className="font-bold text-white">
                      {formatTimeString(day.sunset, units.timeFormat)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
