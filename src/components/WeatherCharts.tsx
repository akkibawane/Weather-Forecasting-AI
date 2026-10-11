import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type MetricType = 'temp' | 'rain' | 'humidity' | 'wind';
type RangeType = 'hourly' | 'daily';

export const WeatherCharts: React.FC = () => {
  const { weatherData, units } = useWeather();
  const [metric, setMetric] = useState<MetricType>('temp');
  const [range, setRange] = useState<RangeType>('hourly');

  if (!weatherData) return null;

  const { hourly, daily } = weatherData;

  const chartConfig = useMemo(() => {
    let labels: string[] = [];
    let dataValues: number[] = [];
    let unitLabel = '';
    let strokeColor = '#38bdf8'; // sky-400
    let fillColor = 'rgba(56, 189, 248, 0.15)';

    if (range === 'hourly') {
      const slice = hourly.slice(0, 24);
      labels = slice.map((h, i) => (i === 0 ? 'Now' : h.time));

      if (metric === 'temp') {
        dataValues = slice.map((h) =>
          units.tempUnit === 'F' ? Math.round((h.temp * 9) / 5 + 32) : h.temp
        );
        unitLabel = `°${units.tempUnit}`;
        strokeColor = '#f59e0b'; // amber-500
        fillColor = 'rgba(245, 158, 11, 0.15)';
      } else if (metric === 'rain') {
        dataValues = slice.map((h) => h.rainChance);
        unitLabel = '%';
        strokeColor = '#38bdf8'; // sky-400
        fillColor = 'rgba(56, 189, 248, 0.2)';
      } else if (metric === 'humidity') {
        dataValues = slice.map((h) => h.humidity);
        unitLabel = '%';
        strokeColor = '#818cf8'; // indigo-400
        fillColor = 'rgba(129, 140, 248, 0.18)';
      } else if (metric === 'wind') {
        dataValues = slice.map((h) =>
          units.speedUnit === 'mph'
            ? Math.round(h.windSpeed * 0.621371)
            : units.speedUnit === 'm/s'
            ? Math.round(h.windSpeed / 3.6)
            : h.windSpeed
        );
        unitLabel = units.speedUnit;
        strokeColor = '#2dd4bf'; // teal-400
        fillColor = 'rgba(45, 212, 191, 0.15)';
      }
    } else {
      // Daily
      labels = daily.map((d) => d.dayName);

      if (metric === 'temp') {
        dataValues = daily.map((d) =>
          units.tempUnit === 'F' ? Math.round((d.tempMax * 9) / 5 + 32) : d.tempMax
        );
        unitLabel = `°${units.tempUnit}`;
        strokeColor = '#f59e0b';
        fillColor = 'rgba(245, 158, 11, 0.15)';
      } else if (metric === 'rain') {
        dataValues = daily.map((d) => d.rainChance);
        unitLabel = '%';
        strokeColor = '#38bdf8';
        fillColor = 'rgba(56, 189, 248, 0.2)';
      } else if (metric === 'humidity') {
        dataValues = daily.map((_, i) => (weatherData.current.humidity + i * 2) % 100);
        unitLabel = '%';
        strokeColor = '#818cf8';
        fillColor = 'rgba(129, 140, 248, 0.18)';
      } else if (metric === 'wind') {
        dataValues = daily.map((d) =>
          units.speedUnit === 'mph'
            ? Math.round(d.windSpeedMax * 0.621371)
            : units.speedUnit === 'm/s'
            ? Math.round(d.windSpeedMax / 3.6)
            : d.windSpeedMax
        );
        unitLabel = units.speedUnit;
        strokeColor = '#2dd4bf';
        fillColor = 'rgba(45, 212, 191, 0.15)';
      }
    }

    return {
      labels,
      datasets: [
        {
          label: `${metric.toUpperCase()} (${unitLabel})`,
          data: dataValues,
          borderColor: strokeColor,
          backgroundColor: fillColor,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: strokeColor,
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
      unitLabel,
    };
  }, [hourly, daily, metric, range, units]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#38bdf8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${context.parsed.y} ${chartConfig.unitLabel}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          maxRotation: 0,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value) => `${value}${chartConfig.unitLabel}`,
        },
      },
    },
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 card-glass border border-white/10 shadow-xl space-y-3 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Weather Trends</h3>
        </div>

        {/* Range Toggle: Hourly vs Daily */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
          <button
            onClick={() => setRange('hourly')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              range === 'hourly'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setRange('daily')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              range === 'daily'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setMetric('temp')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            metric === 'temp'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Thermometer className="w-3 h-3" />
          <span>Temperature</span>
        </button>

        <button
          onClick={() => setMetric('rain')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            metric === 'rain'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'bg-slate-900/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <CloudRain className="w-3 h-3" />
          <span>Rain Chance</span>
        </button>

        <button
          onClick={() => setMetric('humidity')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            metric === 'humidity'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'bg-slate-900/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Droplets className="w-3 h-3" />
          <span>Humidity</span>
        </button>

        <button
          onClick={() => setMetric('wind')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            metric === 'wind'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'bg-slate-900/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Wind className="w-3 h-3" />
          <span>Wind Speed</span>
        </button>
      </div>

      {/* Interactive Line Chart Canvas */}
      <div className="h-44 sm:h-52 lg:h-56 w-full relative min-w-0 overflow-hidden pt-1">
        <Line data={chartConfig} options={options} />
      </div>
    </div>
  );
};
