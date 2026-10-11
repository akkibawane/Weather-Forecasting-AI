import React from 'react';
import {
  CloudRain,
  Thermometer,
  Activity,
  Shirt,
  Sun,
  Sparkles,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export const SmartInsightsGrid: React.FC = () => {
  const { weatherData } = useWeather();

  if (!weatherData || !weatherData.insights || weatherData.insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-amber-400" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'clothing':
        return <Shirt className="w-5 h-5 text-purple-400" />;
      case 'uv':
        return <Sun className="w-5 h-5 text-orange-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-sky-400" />;
    }
  };

  const getBorderColor = (severity?: string) => {
    switch (severity) {
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50';
      case 'alert':
        return 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50';
      default:
        return 'border-sky-500/20 bg-slate-900/40 hover:border-sky-500/40';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Smart Weather Insights</span>
        </h3>
        <span className="text-[10px] sm:text-[11px] text-slate-400">AI Context Analysis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 w-full min-w-0">
        {weatherData.insights.map((item) => (
          <div
            key={item.id}
            className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.01] shadow-md min-w-0 overflow-hidden ${getBorderColor(
              item.severity
            )}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-slate-800/80 border border-white/5 flex-shrink-0">
                {getInsightIcon(item.type)}
              </div>
              <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
                {item.title}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
