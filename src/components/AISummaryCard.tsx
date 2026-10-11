import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Shirt,
  Activity,
  Bot,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

interface AISummaryCardProps {
  onOpenChat: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ onOpenChat }) => {
  const { weatherData } = useWeather();
  const [activeSlot, setActiveSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  if (!weatherData) return null;

  const { aiSummary } = weatherData;

  return (
    <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-sky-500/20 bg-gradient-to-br from-sky-950/30 via-slate-900/60 to-indigo-950/30 shadow-xl relative overflow-hidden transition-all w-full max-w-full min-w-0">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>WeatherAI Smart Summary</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Live AI
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400">Meteorological analysis for your day</p>
          </div>
        </div>

        {/* Badge & Ask AI shortcut */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800/80 text-sky-300 border border-slate-700">
            {aiSummary.summaryBadge}
          </span>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] sm:text-xs font-semibold transition-all hover:scale-105"
          >
            <Bot className="w-3 h-3" />
            <span>Ask Follow-up</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Today's Narrative Overview */}
      <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-white/5 mb-3.5 backdrop-blur-md">
        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
          &ldquo;{aiSummary.overview}&rdquo;
        </p>
      </div>

      {/* Daytime Breakdown Tabs: Morning, Afternoon, Evening */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSlot('morning')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSlot === 'morning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Morning</span>
          </button>

          <button
            onClick={() => setActiveSlot('afternoon')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSlot === 'afternoon'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sunset className="w-3 h-3 text-sky-400" />
            <span>Afternoon</span>
          </button>

          <button
            onClick={() => setActiveSlot('evening')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSlot === 'evening'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3 h-3 text-indigo-300" />
            <span>Evening</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed min-h-[44px] flex items-center">
          <Info className="w-3.5 h-3.5 text-sky-400 mr-2 flex-shrink-0" />
          <span>
            {activeSlot === 'morning' && aiSummary.morning}
            {activeSlot === 'afternoon' && aiSummary.afternoon}
            {activeSlot === 'evening' && aiSummary.evening}
          </span>
        </div>
      </div>

      {/* Clothing & Activity Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-white/10">
        <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/40 border border-white/5 min-w-0">
          <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20 flex-shrink-0">
            <Shirt className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Clothing Suggestion
            </span>
            <p className="text-xs text-slate-200 font-medium mt-0.5">
              {aiSummary.clothing}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/40 border border-white/5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex-shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Activity Recommendation
            </span>
            <p className="text-xs text-slate-200 font-medium mt-0.5">
              {aiSummary.activity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
