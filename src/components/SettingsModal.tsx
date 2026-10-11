import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Thermometer,
  Wind,
  Clock,
  Key,
  Bell,
  Trash2,
  Check,
  Palette,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { THEME_LIST } from '../utils/themeConfig';
import type { TempUnit, SpeedUnit, TimeFormat } from '../types/weather';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    units,
    setUnits,
    themeMode,
    setThemeMode,
    geminiApiKey,
    setGeminiApiKey,
    mapApiKey,
    setMapApiKey,
  } = useWeather();

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [mapApiKeyInput, setMapApiKeyInput] = useState(mapApiKey);
  const [mapApiKeySaved, setMapApiKeySaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleSaveMapApiKey = () => {
    setMapApiKey(mapApiKeyInput.trim());
    setMapApiKeySaved(true);
    setTimeout(() => setMapApiKeySaved(false), 2000);
  };

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">App Settings</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Configure units, AI keys & preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Temperature Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-sky-400" />
              <span>Temperature Unit</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['C', 'F'] as TempUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setUnits({ tempUnit: unit })}
                  className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                    units.tempUnit === unit
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Celsius (°C) {unit === 'C' ? '• Metric' : ''}
                  {unit === 'F' ? 'Fahrenheit (°F) • Imperial' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Wind Speed Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <span>Wind Speed Unit</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['km/h', 'mph', 'm/s'] as SpeedUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setUnits({ speedUnit: unit })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    units.speedUnit === unit
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Time Format</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['12h', '24h'] as TimeFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setUnits({ timeFormat: format })}
                  className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                    units.timeFormat === format
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {format === '12h' ? '12-Hour (AM/PM)' : '24-Hour (Military)'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Background Theme</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {THEME_LIST.find((t) => t.id === themeMode)?.name || 'Aurora'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_LIST.map((theme) => {
                const isSelected = themeMode === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900/90 text-white border-sky-400/60 shadow-md ring-1 ring-sky-400/30'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-5 h-5 rounded-lg border border-white/20 shadow-sm"
                        style={{ background: theme.previewGradient }}
                      />
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-sky-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold truncate text-slate-200">
                        {theme.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {theme.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gemini AI API Key (Optional) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Gemini API Key (Optional)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-normal">
                Built-in offline engine active by default
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (Paste Google Gemini API Key)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all"
              >
                {apiKeySaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{apiKeySaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              WeatherAI works completely offline with realistic meteorological reasoning. Adding your own key unlocks full Gemini 1.5/2.0 conversational synthesis.
            </p>
          </div>

          {/* Weather Map API Key (OpenWeatherMap) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-400" />
                <span>OpenWeatherMap API Key (For Map Layers)</span>
              </span>
              <a
                href="https://home.openweathermap.org/users/sign_up"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-sky-400 hover:underline font-bold"
              >
                Get Free Key ↗
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={mapApiKeyInput}
                onChange={(e) => setMapApiKeyInput(e.target.value)}
                placeholder="Paste OpenWeatherMap API Key (32 characters)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-sky-400"
              />
              <button
                onClick={handleSaveMapApiKey}
                className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all"
              >
                {mapApiKeySaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{mapApiKeySaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>
                <b className="text-emerald-400">✓ RainViewer Live Radar</b> is active right now with <b>no key required</b>.
              </p>
              <p>
                Adding an OpenWeatherMap API key unlocks official high-resolution temperature, wind stream, and infrared cloud satellite layers on the map.
              </p>
            </div>
          </div>

          {/* Severe Weather Notifications Simulation */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-xs font-bold text-white">Weather Alerts & Briefings</p>
                <p className="text-[10px] text-slate-400">Receive active alerts in browser</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                notificationsEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  notificationsEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reset / Cache */}
          <div className="pt-2">
            <button
              onClick={handleClearCache}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear App Cache & Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
