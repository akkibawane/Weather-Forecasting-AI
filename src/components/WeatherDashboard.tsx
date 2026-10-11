import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { CurrentWeather } from './CurrentWeather';
import { AISummaryCard } from './AISummaryCard';
import { SmartInsightsGrid } from './SmartInsightsGrid';
import { HourlyForecast } from './HourlyForecast';
import { DailyForecast } from './DailyForecast';
import { WeatherAlerts } from './WeatherAlerts';
import { WeatherCharts } from './WeatherCharts';
import { AirQualityCard } from './AirQualityCard';
import { WeatherMap } from './WeatherMap';
import { CompareCities } from './CompareCities';
import { FavoritesView } from './FavoritesView';
import { AIWeatherAssistant } from './AIWeatherAssistant';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface WeatherDashboardProps {
  onOpenChat: () => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ onOpenChat }) => {
  const { weatherData, loading, error, activeTab, refreshWeather } = useWeather();

  if (loading && !weatherData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] p-6 text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">🌤️</div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Loading Live Weather Data</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Fetching satellite radar, real-time metrics, air quality, and computing AI recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-6 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Unable to retrieve forecast</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{error}</p>
        </div>
        <button
          onClick={refreshWeather}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // Render specific tab content
  return (
    <main className="flex-1 p-2.5 sm:p-3.5 lg:p-5 w-full max-w-6xl mx-auto space-y-4 pb-20 lg:pb-10 min-w-0 overflow-x-hidden animate-in fade-in duration-300">
      {/* Non-intrusive warning notice if network had an issue and is showing cached data */}
      {error && weatherData && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={refreshWeather}
            className="text-[11px] underline font-bold hover:text-amber-100"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Overview / Main Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Active Severe Weather Alerts */}
          <WeatherAlerts />

          {/* Large Hero Card: Current Weather */}
          <CurrentWeather />

          {/* AI Weather Summary Card */}
          <AISummaryCard onOpenChat={onOpenChat} />

          {/* Smart Insights Cards (Rain alert, Temp vs yesterday, Activity sweet spot, Clothing) */}
          <SmartInsightsGrid />

          {/* Hourly Forecast Carousel */}
          <HourlyForecast />

          {/* 7-Day Forecast */}
          <DailyForecast />

          {/* Interactive Trends Charts (Hourly/Daily with Temp, Rain, Humidity, Wind) */}
          <WeatherCharts />

          {/* Air Quality Index Breakdown */}
          <AirQualityCard />

          {/* Weather Radar Map Preview */}
          <WeatherMap />
        </div>
      )}

      {/* 7-Day & Hourly Detailed Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <HourlyForecast />
          <DailyForecast />
          <WeatherCharts />
        </div>
      )}

      {/* Air Quality Deep Dive Tab */}
      {activeTab === 'air-quality' && (
        <div className="space-y-4">
          <AirQualityCard />
          <SmartInsightsGrid />
        </div>
      )}

      {/* Interactive Radar & Weather Map Tab */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <WeatherMap />
        </div>
      )}

      {/* Saved Favorite Locations Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <FavoritesView />
        </div>
      )}

      {/* Compare Cities Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <CompareCities />
        </div>
      )}

      {/* AI Assistant Full Tab */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          <AIWeatherAssistant isModal={false} />
        </div>
      )}
    </main>
  );
};
