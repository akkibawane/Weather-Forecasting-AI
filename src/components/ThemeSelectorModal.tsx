import React from 'react';
import {
  X,
  Palette,
  Sparkles,
  Moon,
  Sunset,
  Zap,
  Shield,
  Sun,
  CloudSun,
  Check,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { THEME_LIST, type ThemeDefinition } from '../utils/themeConfig';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { themeMode, setThemeMode } = useWeather();

  if (!isOpen) return null;

  const getThemeIcon = (name: ThemeDefinition['iconName']) => {
    const cls = 'w-4 h-4';
    switch (name) {
      case 'sparkles':
        return <Sparkles className={cls} />;
      case 'moon':
        return <Moon className={cls} />;
      case 'sunset':
        return <Sunset className={cls} />;
      case 'zap':
        return <Zap className={cls} />;
      case 'shield':
        return <Shield className={cls} />;
      case 'sun':
        return <Sun className={cls} />;
      case 'cloud-sun':
        return <CloudSun className={cls} />;
      default:
        return <Palette className={cls} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Choose Background Theme</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Personalize ambient atmosphere, mesh glows, and gradients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Themes List / Grid */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto">
          {THEME_LIST.map((theme) => {
            const isSelected = themeMode === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setThemeMode(theme.id);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 group relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900/90 border-sky-400/60 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/30'
                    : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Visual Gradient Swatch Preview */}
                <div
                  className="w-12 h-12 rounded-xl flex-shrink-0 shadow-md border border-white/15 relative overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ background: theme.previewGradient }}
                >
                  <div className="text-white drop-shadow-md">
                    {getThemeIcon(theme.iconName)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {theme.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                    >
                      {theme.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {theme.description}
                  </p>
                </div>

                {/* Selected Checkmark */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/40">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500 transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-5">
          <span>Theme saves automatically to your preferences</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all shadow-md shadow-sky-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
