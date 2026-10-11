import React from 'react';
import {
  Wind,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { getAQIInfo } from '../utils/weatherUtils';

export const AirQualityCard: React.FC = () => {
  const { weatherData } = useWeather();

  if (!weatherData || !weatherData.airQuality) return null;

  const { airQuality } = weatherData;
  const aqiMeta = getAQIInfo(airQuality.aqi);

  // Pollutant thresholds for progress bars
  const pollutants = [
    { name: 'PM2.5', value: airQuality.pm2_5, unit: 'µg/m³', max: 50, label: 'Fine Particles' },
    { name: 'PM10', value: airQuality.pm10, unit: 'µg/m³', max: 100, label: 'Respirable Dust' },
    { name: 'O₃', value: airQuality.o3, unit: 'µg/m³', max: 120, label: 'Ozone' },
    { name: 'NO₂', value: airQuality.no2, unit: 'µg/m³', max: 80, label: 'Nitrogen Dioxide' },
    { name: 'SO₂', value: airQuality.so2, unit: 'µg/m³', max: 40, label: 'Sulphur Dioxide' },
    { name: 'CO', value: airQuality.co, unit: 'µg/m³', max: 1000, label: 'Carbon Monoxide' },
  ];

  return (
    <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl space-y-3.5 sm:space-y-4 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Air Quality & Health Index</h3>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md"
          style={{
            backgroundColor: aqiMeta.badgeBg,
            borderColor: `${aqiMeta.color}40`,
            color: aqiMeta.color,
          }}
        >
          {aqiMeta.level}
        </span>
      </div>

      {/* Main AQI Meter & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Circular / Gauge Display */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-white/5 text-center min-w-0">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* SVG circular gauge */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={aqiMeta.color}
                strokeWidth="8"
                strokeDasharray={264}
                strokeDashoffset={264 - (Math.min(100, airQuality.aqi) / 100) * 264}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {airQuality.aqi}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                AQI
              </span>
            </div>
          </div>
          <p
            className="text-xs sm:text-sm font-bold mt-1.5"
            style={{ color: aqiMeta.color }}
          >
            {aqiMeta.level}
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-full">
            Dominant: {airQuality.dominantPollutant}
          </span>
        </div>

        {/* Right: AI Health Guidance & Analysis */}
        <div className="md:col-span-8 space-y-2.5 min-w-0">
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Health Assessment</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              &ldquo;{airQuality.explanation}&rdquo;
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] sm:text-xs text-slate-300 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Standard EPA and European scale. Values below 40 indicate clean air, while readings over 60 suggest sensitive individuals should wear masks or limit prolonged outdoor cardio.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 6 Specific Pollutant Meters */}
      <div>
        <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Pollutant Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-2.5">
          {pollutants.map((p) => {
            const percent = Math.min(100, Math.round((p.value / p.max) * 100));
            return (
              <div
                key={p.name}
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/40 border border-white/5 space-y-1 min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {p.value} {p.unit}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 truncate">{p.label}</p>
                {/* Micro meter */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent > 75
                        ? 'bg-rose-500'
                        : percent > 50
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
