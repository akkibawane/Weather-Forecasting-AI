import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { getWeatherCondition } from '../utils/weatherUtils';

export const BackgroundEffects: React.FC = () => {
  const { themeMode, weatherData } = useWeather();

  // Resolve color palettes for the floating ambient aura spheres
  const getOrbColors = () => {
    switch (themeMode) {
      case 'aurora':
        return {
          orb1: 'bg-emerald-500/25',
          orb2: 'bg-cyan-500/25',
          orb3: 'bg-purple-600/20',
        };
      case 'midnight':
        return {
          orb1: 'bg-blue-600/30',
          orb2: 'bg-sky-500/25',
          orb3: 'bg-indigo-600/20',
        };
      case 'sunset':
        return {
          orb1: 'bg-amber-500/25',
          orb2: 'bg-rose-500/25',
          orb3: 'bg-purple-600/20',
        };
      case 'cyberpunk':
        return {
          orb1: 'bg-fuchsia-500/30',
          orb2: 'bg-cyan-500/25',
          orb3: 'bg-purple-600/25',
        };
      case 'obsidian':
        return {
          orb1: 'bg-slate-700/15',
          orb2: 'bg-slate-800/20',
          orb3: 'bg-slate-900/20',
        };
      case 'light':
        return {
          orb1: 'bg-sky-400/20',
          orb2: 'bg-indigo-300/20',
          orb3: 'bg-blue-200/25',
        };
      case 'auto':
      default: {
        if (!weatherData) {
          return {
            orb1: 'bg-sky-500/25',
            orb2: 'bg-amber-500/20',
            orb3: 'bg-indigo-500/20',
          };
        }
        const cond = getWeatherCondition(
          weatherData.current.conditionCode,
          weatherData.current.isDay
        );
        switch (cond.weatherType) {
          case 'sunny':
            return {
              orb1: 'bg-amber-500/30',
              orb2: 'bg-orange-500/20',
              orb3: 'bg-sky-500/20',
            };
          case 'rain':
            return {
              orb1: 'bg-sky-600/30',
              orb2: 'bg-blue-700/25',
              orb3: 'bg-teal-500/20',
            };
          case 'storm':
            return {
              orb1: 'bg-purple-600/35',
              orb2: 'bg-amber-600/20',
              orb3: 'bg-indigo-700/25',
            };
          case 'snow':
            return {
              orb1: 'bg-sky-300/30',
              orb2: 'bg-blue-200/25',
              orb3: 'bg-indigo-300/20',
            };
          default:
            return {
              orb1: 'bg-slate-500/25',
              orb2: 'bg-sky-600/20',
              orb3: 'bg-blue-800/20',
            };
        }
      }
    }
  };

  const colors = getOrbColors();

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-all duration-1000"
      aria-hidden="true"
    >
      {/* Primary Ambient Aura Orb */}
      <div
        className={`absolute -top-24 -left-24 w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] rounded-full blur-[100px] sm:blur-[140px] ${colors.orb1} animate-orb-1 opacity-70`}
      />

      {/* Secondary Ambient Aura Orb */}
      <div
        className={`absolute top-1/4 -right-28 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[100px] sm:blur-[140px] ${colors.orb2} animate-orb-2 opacity-65`}
      />

      {/* Tertiary Bottom Atmosphere Orb */}
      <div
        className={`absolute -bottom-24 left-1/3 w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] rounded-full blur-[110px] sm:blur-[150px] ${colors.orb3} animate-aura-pulse opacity-60`}
      />

      {/* Subtle Star / Dust Vignette Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-overlay" />
    </div>
  );
};
