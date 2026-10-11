import type { TempUnit, SpeedUnit, TimeFormat } from '../types/weather';

export interface WeatherConditionInfo {
  name: string;
  icon: string; // Lucide icon identifier or emoji
  weatherType: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
  bgGradient: string;
}

// Map WMO Weather Interpretation Codes (Open-Meteo)
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        name: isDay ? 'Clear Sky' : 'Clear Night',
        icon: isDay ? 'Sun' : 'Moon',
        weatherType: isDay ? 'sunny' : 'cloudy',
        bgGradient: isDay
          ? 'from-sky-500/20 via-amber-500/10 to-indigo-900/40'
          : 'from-indigo-950 via-slate-900 to-slate-950',
      };
    case 1:
      return {
        name: 'Mainly Clear',
        icon: isDay ? 'SunMedium' : 'Moon',
        weatherType: isDay ? 'sunny' : 'cloudy',
        bgGradient: 'from-sky-500/20 via-blue-500/10 to-slate-900/40',
      };
    case 2:
      return {
        name: 'Partly Cloudy',
        icon: isDay ? 'CloudSun' : 'CloudMoon',
        weatherType: 'cloudy',
        bgGradient: 'from-blue-600/20 via-slate-600/20 to-slate-900/50',
      };
    case 3:
      return {
        name: 'Overcast',
        icon: 'Cloud',
        weatherType: 'cloudy',
        bgGradient: 'from-slate-600/25 via-zinc-700/20 to-slate-950/60',
      };
    case 45:
    case 48:
      return {
        name: code === 48 ? 'Depositing Rime Fog' : 'Foggy',
        icon: 'CloudFog',
        weatherType: 'fog',
        bgGradient: 'from-teal-800/20 via-slate-700/25 to-slate-900/60',
      };
    case 51:
    case 53:
    case 55:
      return {
        name: 'Drizzle',
        icon: 'CloudDrizzle',
        weatherType: 'rain',
        bgGradient: 'from-cyan-700/20 via-blue-800/20 to-slate-900/60',
      };
    case 56:
    case 57:
      return {
        name: 'Freezing Drizzle',
        icon: 'CloudHail',
        weatherType: 'snow',
        bgGradient: 'from-cyan-600/20 via-slate-700/20 to-blue-950/60',
      };
    case 61:
      return {
        name: 'Slight Rain',
        icon: 'CloudRain',
        weatherType: 'rain',
        bgGradient: 'from-blue-600/25 via-indigo-800/20 to-slate-950/60',
      };
    case 63:
      return {
        name: 'Moderate Rain',
        icon: 'CloudRain',
        weatherType: 'rain',
        bgGradient: 'from-blue-700/30 via-slate-800/30 to-slate-950/70',
      };
    case 65:
      return {
        name: 'Heavy Rain',
        icon: 'CloudRainWind',
        weatherType: 'rain',
        bgGradient: 'from-blue-900/40 via-indigo-950/40 to-slate-950/80',
      };
    case 66:
    case 67:
      return {
        name: 'Freezing Rain',
        icon: 'CloudHail',
        weatherType: 'snow',
        bgGradient: 'from-teal-900/30 via-slate-900/40 to-slate-950/70',
      };
    case 71:
    case 73:
    case 75:
      return {
        name: code === 71 ? 'Light Snow' : code === 75 ? 'Heavy Snow' : 'Moderate Snow',
        icon: 'Snowflake',
        weatherType: 'snow',
        bgGradient: 'from-cyan-400/20 via-slate-700/30 to-slate-950/60',
      };
    case 77:
      return {
        name: 'Snow Grains',
        icon: 'Snowflake',
        weatherType: 'snow',
        bgGradient: 'from-cyan-500/20 via-slate-800/30 to-slate-950/60',
      };
    case 80:
    case 81:
    case 82:
      return {
        name: code === 82 ? 'Violent Rain Showers' : 'Rain Showers',
        icon: 'CloudRainWind',
        weatherType: 'rain',
        bgGradient: 'from-blue-700/35 via-indigo-900/35 to-slate-950/80',
      };
    case 85:
    case 86:
      return {
        name: 'Snow Showers',
        icon: 'Snowflake',
        weatherType: 'snow',
        bgGradient: 'from-blue-500/20 via-slate-700/30 to-slate-950/60',
      };
    case 95:
      return {
        name: 'Thunderstorm',
        icon: 'CloudLightning',
        weatherType: 'storm',
        bgGradient: 'from-amber-600/25 via-purple-900/35 to-slate-950/80',
      };
    case 96:
    case 99:
      return {
        name: 'Thunderstorm with Hail',
        icon: 'CloudLightning',
        weatherType: 'storm',
        bgGradient: 'from-purple-900/40 via-red-950/30 to-slate-950/90',
      };
    default:
      return {
        name: 'Partly Cloudy',
        icon: 'CloudSun',
        weatherType: 'cloudy',
        bgGradient: 'from-blue-600/20 via-slate-600/20 to-slate-900/50',
      };
  }
}

// Convert Celsius to Fahrenheit
export function formatTemp(tempC: number, unit: TempUnit = 'C'): string {
  if (unit === 'F') {
    return `${Math.round((tempC * 9) / 5 + 32)}°`;
  }
  return `${Math.round(tempC)}°`;
}

// Convert wind speed
export function formatSpeed(speedKmh: number, unit: SpeedUnit = 'km/h'): string {
  if (unit === 'mph') {
    return `${Math.round(speedKmh * 0.621371)} mph`;
  }
  if (unit === 'm/s') {
    return `${(speedKmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

// Format time string (e.g., "14:00" -> "2:00 PM" if 12h)
export function formatTimeString(isoOrTimeString: string, format: TimeFormat = '12h'): string {
  if (!isoOrTimeString) return '';
  const date = isoOrTimeString.includes('T') ? new Date(isoOrTimeString) : new Date(`2000-01-01T${isoOrTimeString}`);

  if (isNaN(date.getTime())) {
    // fallback string parser
    const parts = isoOrTimeString.split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1].padStart(2, '0');
      if (format === '12h') {
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
      }
      return `${h.toString().padStart(2, '0')}:${m}`;
    }
    return isoOrTimeString;
  }

  if (format === '12h') {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Wind direction degrees to cardinal point
export function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// UV index risk category and color
export function getUVInfo(uv: number): { label: string; color: string; advice: string } {
  if (uv <= 2) return { label: 'Low', color: '#10b981', advice: 'No protection needed. Safe for outdoor activities.' };
  if (uv <= 5) return { label: 'Moderate', color: '#f59e0b', advice: 'Wear sunglasses and apply sunscreen during midday.' };
  if (uv <= 7) return { label: 'High', color: '#f97316', advice: 'Protection required. Seek shade during peak afternoon sun.' };
  if (uv <= 10) return { label: 'Very High', color: '#ef4444', advice: 'Take extra precautions. Skin and eyes can burn quickly.' };
  return { label: 'Extreme', color: '#a855f7', advice: 'Avoid sun exposure outside midday. Full protection mandatory.' };
}

// Air Quality Index interpretation (European / US standard hybrid)
export function getAQIInfo(aqi: number): {
  level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  badgeBg: string;
  description: string;
} {
  if (aqi <= 20) {
    return {
      level: 'Good',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      description: 'Air quality is satisfactory and poses little or no risk.',
    };
  }
  if (aqi <= 40) {
    return {
      level: 'Moderate',
      color: '#3b82f6',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      description: 'Air quality is acceptable; moderately clean.',
    };
  }
  if (aqi <= 60) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      description: 'Sensitive individuals may experience minor respiratory irritation.',
    };
  }
  if (aqi <= 80) {
    return {
      level: 'Unhealthy',
      color: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      description: 'Everyone may begin to experience health effects; limit intense outdoor cardio.',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'Very Unhealthy',
      color: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      description: 'Health alert: increased risk of respiratory and cardiovascular issues.',
    };
  }
  return {
    level: 'Hazardous',
    color: '#831843',
    badgeBg: 'rgba(131, 24, 67, 0.25)',
    description: 'Emergency health warning: serious health hazards for all individuals.',
  };
}
