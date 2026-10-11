import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Wind,
  CloudLightning,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import type { WeatherAlert } from '../types/weather';

export const WeatherAlerts: React.FC = () => {
  const { weatherData } = useWeather();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  if (!weatherData || !weatherData.alerts || weatherData.alerts.length === 0) {
    return null;
  }

  const activeAlerts = weatherData.alerts.filter((a) => !dismissedIds.includes(a.id));

  if (activeAlerts.length === 0) return null;

  const getSeverityStyle = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'extreme':
        return {
          bg: 'bg-rose-950/70 border-rose-500/70 text-rose-200',
          badgeBg: 'bg-rose-600 text-white',
          iconColor: 'text-rose-400',
        };
      case 'high':
        return {
          bg: 'bg-red-950/60 border-red-500/60 text-red-200',
          badgeBg: 'bg-red-600 text-white',
          iconColor: 'text-red-400',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-950/60 border-amber-500/60 text-amber-200',
          badgeBg: 'bg-amber-600 text-white',
          iconColor: 'text-amber-400',
        };
      case 'low':
      default:
        return {
          bg: 'bg-sky-950/60 border-sky-500/50 text-sky-200',
          badgeBg: 'bg-sky-600 text-white',
          iconColor: 'text-sky-400',
        };
    }
  };

  const getAlertIcon = (event: string) => {
    const e = event.toLowerCase();
    if (e.includes('heat')) return <Flame className="w-5 h-5 animate-pulse" />;
    if (e.includes('wind')) return <Wind className="w-5 h-5 animate-bounce-subtle" />;
    if (e.includes('thunder') || e.includes('storm')) return <CloudLightning className="w-5 h-5 animate-pulse" />;
    return <AlertTriangle className="w-5 h-5 animate-pulse" />;
  };

  return (
    <div className="space-y-2.5">
      {activeAlerts.map((alert) => {
        const style = getSeverityStyle(alert.severity);
        const isExpanded = expandedId === alert.id;

        return (
          <div
            key={alert.id}
            className={`rounded-2xl border p-4 backdrop-blur-xl shadow-xl transition-all ${style.bg}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl bg-black/20 ${style.iconColor}`}>
                  {getAlertIcon(alert.event)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${style.badgeBg}`}>
                      {alert.severity} Severity
                    </span>
                    <h4 className="text-sm font-bold tracking-tight text-white">
                      {alert.event}
                    </h4>
                  </div>
                  <p className="text-xs font-medium mt-1 text-slate-200">
                    {alert.headline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 hover:text-white transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand safety details'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDismissedIds((prev) => [...prev, alert.id])}
                  className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-400 hover:text-white transition-colors"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable Safety Guidance */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2 animate-in fade-in duration-200">
                <p className="text-slate-200 leading-relaxed">
                  {alert.description}
                </p>
                {alert.instruction && (
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Recommended Safety Action: </span>
                      <span className="text-slate-200">{alert.instruction}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Source: {alert.source}</span>
                  <span>Valid: {alert.effective} – {alert.expires}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
