import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Wind,
  Map as MapIcon,
  Star,
  GitCompare,
  Bot,
  Settings as SettingsIcon,
  AlertTriangle,
  Palette,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { THEME_LIST } from '../utils/themeConfig';
import type { ActiveTab } from '../context/WeatherContext';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenChat: () => void;
  onOpenTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings, onOpenChat, onOpenTheme }) => {
  const { activeTab, setActiveTab, weatherData, favorites, themeMode } = useWeather();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    specialAction?: () => void;
  }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'forecast', label: '7-Day Forecast', icon: CalendarDays },
    { id: 'air-quality', label: 'Air Quality', icon: Wind },
    { id: 'map', label: 'Radar & Maps', icon: MapIcon },
    {
      id: 'favorites',
      label: 'Saved Cities',
      icon: Star,
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
    { id: 'compare', label: 'Compare Cities', icon: GitCompare },
    {
      id: 'assistant',
      label: 'WeatherAI Bot',
      icon: Bot,
      specialAction: () => {
        setActiveTab('assistant');
        onOpenChat();
      },
    },
  ];

  const alertCount = weatherData?.alerts.length || 0;

  return (
    <aside className="hidden lg:flex flex-col w-48 xl:w-52 flex-shrink-0 h-[calc(100vh-58px)] sticky top-14 sidebar-glass border-r border-slate-800/80 p-2.5 xl:p-3 transition-all">
      {/* Navigation menu */}
      <div className="space-y-1">
        <p className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.specialAction) {
                  item.specialAction();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-medium text-xs xl:text-sm transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-sky-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Alerts Banner if present */}
      {alertCount > 0 && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Active Weather Alert</span>
          </div>
          <p className="text-[11px] text-amber-300/90 line-clamp-2">
            {weatherData?.alerts[0]?.headline}
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="mt-2 text-[10px] font-semibold text-amber-400 underline hover:text-amber-300"
          >
            Review Safety Steps →
          </button>
        </div>
      )}

      {/* Quick Location Snapshot card at bottom of sidebar */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-3">
        {weatherData && (
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Viewing</span>
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {weatherData.location.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-sky-400">
                  {weatherData.current.temp}°
                </span>
                <p className="text-[10px] text-slate-400">{weatherData.current.condition}</p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Button */}
        {(() => {
          const currentTheme = THEME_LIST.find((t) => t.id === themeMode) || THEME_LIST[0];
          return (
            <button
              onClick={onOpenTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors group"
              title={`Active Theme: ${currentTheme.name}`}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
                <span>Theme</span>
              </div>
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                style={{ background: currentTheme.previewGradient }}
              />
            </button>
          );
        })()}

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Preferences & Units</span>
        </button>
      </div>
    </aside>
  );
};
