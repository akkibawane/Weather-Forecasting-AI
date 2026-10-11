import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Wind,
  Map as MapIcon,
  Bot,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import type { ActiveTab } from '../context/WeatherContext';

interface BottomNavProps {
  onOpenChat: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenChat }) => {
  const { activeTab, setActiveTab } = useWeather();

  const tabs: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: () => void;
  }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'forecast', label: '7-Day', icon: CalendarDays },
    { id: 'map', label: 'Radar', icon: MapIcon },
    { id: 'air-quality', label: 'Air AQI', icon: Wind },
    {
      id: 'assistant',
      label: 'AI Chat',
      icon: Bot,
      action: () => {
        setActiveTab('assistant');
        onOpenChat();
      },
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around safe-bottom shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.action) {
                tab.action();
              } else {
                setActiveTab(tab.id);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-sky-400 font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-500/20' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
