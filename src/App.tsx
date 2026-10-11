import React, { useState } from 'react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { WeatherDashboard } from './components/WeatherDashboard';
import { AIWeatherAssistant } from './components/AIWeatherAssistant';
import { SettingsModal } from './components/SettingsModal';
import { ShareWeatherModal } from './components/ShareWeatherModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { BackgroundEffects } from './components/BackgroundEffects';
import { getWeatherCondition } from './utils/weatherUtils';

const AppContent: React.FC = () => {
  const { weatherData, themeMode } = useWeather();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Determine dynamic background class based on theme or weather condition
  const getDynamicBgClass = () => {
    switch (themeMode) {
      case 'aurora':
        return 'theme-aurora';
      case 'midnight':
        return 'theme-midnight';
      case 'sunset':
        return 'theme-sunset';
      case 'cyberpunk':
        return 'theme-cyberpunk';
      case 'obsidian':
        return 'theme-obsidian';
      case 'light':
        return 'theme-light';
      case 'auto':
      default: {
        if (!weatherData) return 'weather-bg-sunny';

        const cond = getWeatherCondition(
          weatherData.current.conditionCode,
          weatherData.current.isDay
        );

        switch (cond.weatherType) {
          case 'sunny':
            return 'weather-bg-sunny';
          case 'cloudy':
            return 'weather-bg-cloudy';
          case 'rain':
            return 'weather-bg-rain';
          case 'storm':
            return 'weather-bg-storm';
          case 'snow':
            return 'weather-bg-snow';
          case 'fog':
            return 'weather-bg-fog';
          default:
            return 'weather-bg-cloudy';
        }
      }
    }
  };

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden transition-colors duration-700 flex flex-col relative ${getDynamicBgClass()}`}
    >
      {/* Dynamic Ambient Background Aura & Particle Layer */}
      <BackgroundEffects />

      {/* Top Search & Nav Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenChat={() => setIsChatModalOpen(true)}
        onOpenTheme={() => setIsThemeModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full relative min-w-0 overflow-x-hidden z-10">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenChat={() => setIsChatModalOpen(true)}
          onOpenTheme={() => setIsThemeModalOpen(true)}
        />

        {/* Dashboard Content Container */}
        <div className="flex-1 min-w-0 w-full overflow-x-hidden">
          <WeatherDashboard onOpenChat={() => setIsChatModalOpen(true)} />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenChat={() => setIsChatModalOpen(true)} />

      {/* Floating AI Assistant Chatbot Modal */}
      <AIWeatherAssistant
        isModal={true}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Share Weather Modal */}
      <ShareWeatherModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WeatherProvider>
      <AppContent />
    </WeatherProvider>
  );
}
