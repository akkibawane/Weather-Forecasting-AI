import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  Cloud,
  Play,
  Pause,
  RotateCcw,
  Key,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

type MapLayer = 'radar' | 'temp' | 'wind' | 'clouds';

interface RadarFrame {
  time: number;
  path: string;
}

export const WeatherMap: React.FC = () => {
  const { weatherData, mapApiKey } = useWeather();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const weatherTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayer>('radar');
  const [isPlaying, setIsPlaying] = useState(false);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [tileHost, setTileHost] = useState('https://tilecache.rainviewer.com');
  const [radarLoading, setRadarLoading] = useState(true);

  // Fetch real live Doppler radar frames from RainViewer (free public open weather API)
  useEffect(() => {
    let isMounted = true;
    const fetchRadarFrames = async () => {
      try {
        setRadarLoading(true);
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('Failed to fetch RainViewer radar maps');
        const data = await res.json();
        if (isMounted && data.radar && Array.isArray(data.radar.past)) {
          const frames: RadarFrame[] = [...data.radar.past];
          if (data.radar.nowcast && Array.isArray(data.radar.nowcast)) {
            frames.push(...data.radar.nowcast);
          }
          setTileHost(data.host || 'https://tilecache.rainviewer.com');
          setRadarFrames(frames);
          setCurrentFrameIndex(frames.length > 0 ? frames.length - 1 : 0);
        }
      } catch (e) {
        console.warn('RainViewer API fetch failed, fallback radar mode enabled', e);
      } finally {
        if (isMounted) setRadarLoading(false);
      }
    };

    fetchRadarFrames();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = weatherData?.location.latitude || 40.7128;
    const lon = weatherData?.location.longitude || -74.006;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark theme base map tiles (CartoDB Dark Matter)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lon], 7);
    }

    // Add or update city marker
    if (mapInstanceRef.current && weatherData) {
      if (markerRef.current) {
        markerRef.current.remove();
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #0284c7, #4f46e5);
            color: white;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.6);
            border: 2px solid white;
            white-space: nowrap;
          ">
            <span>📍 ${weatherData.location.name}</span>
            <span style="color: #38bdf8;">${weatherData.current.temp}°</span>
          </div>
        `,
        iconSize: [130, 36],
        iconAnchor: [65, 18],
      });

      markerRef.current = L.marker([lat, lon], { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 12px; color: #1e293b;">
            <b>${weatherData.location.name}</b><br/>
            ${weatherData.current.condition} • ${weatherData.current.temp}°C<br/>
            Wind: ${weatherData.current.windSpeed} km/h • Rain: ${weatherData.current.rainChance}%
          </div>`
        );
    }
  }, [weatherData]);

  // Update dynamic weather layer tiles (Real RainViewer Doppler Radar OR OpenWeatherMap)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing weather tile layer
    if (weatherTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(weatherTileLayerRef.current);
      weatherTileLayerRef.current = null;
    }

    // 1. Radar Layer: Uses real RainViewer live Doppler radar tiles (No key required!)
    if (activeLayer === 'radar' && radarFrames.length > 0 && radarFrames[currentFrameIndex]) {
      const frame = radarFrames[currentFrameIndex];
      const radarUrl = `${tileHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      const radarLayer = L.tileLayer(radarUrl, {
        opacity: 0.8,
        maxZoom: 19,
        zIndex: 10,
      });

      radarLayer.addTo(mapInstanceRef.current);
      weatherTileLayerRef.current = radarLayer;
      return;
    }

    // 2. OpenWeatherMap tile layers (if mapApiKey is present)
    if (mapApiKey) {
      let owmLayer = 'precipitation_new';
      if (activeLayer === 'temp') owmLayer = 'temp_new';
      if (activeLayer === 'wind') owmLayer = 'wind_new';
      if (activeLayer === 'clouds') owmLayer = 'clouds_new';

      const owmUrl = `https://tile.openweathermap.org/map/${owmLayer}/{z}/{x}/{y}.png?appid=${mapApiKey}`;
      const owmTileLayer = L.tileLayer(owmUrl, {
        opacity: 0.75,
        maxZoom: 19,
        zIndex: 10,
      });

      owmTileLayer.addTo(mapInstanceRef.current);
      weatherTileLayerRef.current = owmTileLayer;
      return;
    }

    // 3. Fallback live radar layer if user chose non-radar layer without an OpenWeatherMap API key
    if (radarFrames.length > 0) {
      const frame = radarFrames[radarFrames.length - 1];
      const fallbackUrl = `${tileHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      const fallbackLayer = L.tileLayer(fallbackUrl, {
        opacity: 0.6,
        maxZoom: 19,
        zIndex: 10,
      });
      fallbackLayer.addTo(mapInstanceRef.current);
      weatherTileLayerRef.current = fallbackLayer;
    }
  }, [activeLayer, currentFrameIndex, radarFrames, tileHost, mapApiKey]);

  // Radar animation player loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && radarFrames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length]);

  const currentFrame = radarFrames[currentFrameIndex];
  const frameTimeFormatted = currentFrame
    ? new Date(currentFrame.time * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Live';

  return (
    <div className="rounded-2xl sm:rounded-3xl card-glass border border-white/10 shadow-xl overflow-hidden relative flex flex-col h-[380px] sm:h-[460px] lg:h-[500px] w-full max-w-full min-w-0">
      {/* Top Map Bar: Title & Layers */}
      <div className="p-2.5 sm:p-3.5 bg-slate-900/85 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <span>Interactive Weather Map</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                Live Doppler
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
              Real-time precipitation radar & satellite layers
            </p>
          </div>
        </div>

        {/* Layer Switches */}
        <div className="flex flex-wrap items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-700/60 max-w-full">
          <button
            onClick={() => setActiveLayer('radar')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
              activeLayer === 'radar'
                ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            <span><span className="hidden sm:inline">Live </span>Radar</span>
          </button>

          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
              activeLayer === 'temp'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3 h-3" />
            <span>Temp<span className="hidden sm:inline">erature</span></span>
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
              activeLayer === 'wind'
                ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3 h-3" />
            <span>Wind<span className="hidden sm:inline"> Stream</span></span>
          </button>

          <button
            onClick={() => setActiveLayer('clouds')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
              activeLayer === 'clouds'
                ? 'bg-slate-700/50 text-slate-200 border border-slate-600 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3 h-3" />
            <span>Clouds</span>
          </button>
        </div>
      </div>

      {/* Map Information / Key Status Banner */}
      <div className="px-3 sm:px-4 py-1.5 bg-slate-950/90 border-b border-white/5 flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-300 truncate">
            {mapApiKey ? (
              <span className="text-emerald-300 font-medium">
                OpenWeatherMap Key Active • Custom thermal, wind & cloud tiles enabled
              </span>
            ) : (
              <span className="text-slate-300 font-medium">
                Live RainViewer Doppler Radar Active (100% Free • No Key Required)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
          <Key className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>
            {mapApiKey ? (
              <span className="text-emerald-400 font-mono">Key: ••••••••</span>
            ) : (
              <span>Add key in Settings for extra layers</span>
            )}
          </span>
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0" />

      {/* Radar Timeline Playback Control Bar */}
      <div className="p-2.5 sm:p-3 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 z-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={radarFrames.length === 0}
            className="p-1.5 sm:p-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white shadow-md shadow-sky-500/20 transition-all hover:scale-105"
            title={isPlaying ? 'Pause Radar' : 'Play Live Doppler Radar Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentFrameIndex(radarFrames.length - 1);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Reset to latest live radar frame"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          <div>
            <span className="text-[11px] sm:text-xs font-bold text-white block">
              {radarLoading
                ? 'Syncing Radar Frames...'
                : `Radar: ${frameTimeFormatted} ${
                    currentFrameIndex === radarFrames.length - 1 ? '(Current)' : ''
                  }`}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400">
              {activeLayer === 'radar'
                ? 'RainViewer Global Doppler Radar'
                : mapApiKey
                ? 'OpenWeatherMap Weather Network'
                : 'Doppler Radar Overlay Active'}
            </span>
          </div>
        </div>

        {/* Timeline Frame Step Scrubber */}
        {radarFrames.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full py-0.5 min-w-0">
            {radarFrames.map((frame, idx) => (
              <button
                key={frame.time}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(idx);
                }}
                className={`h-2 sm:h-2.5 rounded-full transition-all flex-shrink-0 ${
                  currentFrameIndex === idx
                    ? 'w-6 sm:w-7 bg-sky-400 shadow-sm shadow-sky-400/60'
                    : 'w-1.5 sm:w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Frame ${new Date(frame.time * 1000).toLocaleTimeString()}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
