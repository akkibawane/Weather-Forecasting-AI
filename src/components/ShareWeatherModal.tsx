import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp } from '../utils/weatherUtils';

interface ShareWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareWeatherModal: React.FC<ShareWeatherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { weatherData, units } = useWeather();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !weatherData) return null;

  const shareText = `🌤️ WeatherAI Forecast for ${weatherData.location.name}:
Currently: ${formatTemp(weatherData.current.temp, units.tempUnit)} (${weatherData.current.condition})
Feels like: ${formatTemp(weatherData.current.feelsLike, units.tempUnit)}
Rain chance: ${weatherData.current.rainChance}% • Humidity: ${weatherData.current.humidity}%
AQI: ${weatherData.airQuality.aqi} (${weatherData.airQuality.aqiLevel})
AI Summary: "${weatherData.aiSummary.overview}"`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Share Weather Forecast</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-inner relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> WeatherAI Card
                </span>
                <h4 className="text-lg font-extrabold text-white mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>{weatherData.location.name}</span>
                </h4>
                <p className="text-xs text-slate-400">{weatherData.location.country}</p>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <WeatherIcon icon={weatherData.current.icon} size={32} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className="text-4xl font-black text-white font-mono">
                {formatTemp(weatherData.current.temp, units.tempUnit)}
              </span>
              <span className="text-sm font-bold text-slate-300 capitalize">
                {weatherData.current.condition}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium line-clamp-2 border-t border-white/5 pt-2">
              &ldquo;{weatherData.aiSummary.overview}&rdquo;
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopySummary}
              className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied Text' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Web Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
