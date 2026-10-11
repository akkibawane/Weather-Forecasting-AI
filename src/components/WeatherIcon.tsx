import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudHail,
  Snowflake,
  CloudLightning,
} from 'lucide-react';

interface WeatherIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  icon,
  size = 28,
  className = '',
}) => {
  switch (icon) {
    case 'Sun':
      return <Sun size={size} className={`text-amber-400 animate-spin-slow ${className}`} />;
    case 'SunMedium':
      return <SunMedium size={size} className={`text-amber-300 ${className}`} />;
    case 'Moon':
      return <Moon size={size} className={`text-indigo-200 ${className}`} />;
    case 'CloudSun':
      return <CloudSun size={size} className={`text-sky-300 ${className}`} />;
    case 'CloudMoon':
      return <CloudMoon size={size} className={`text-indigo-300 ${className}`} />;
    case 'Cloud':
      return <Cloud size={size} className={`text-slate-300 ${className}`} />;
    case 'CloudFog':
      return <CloudFog size={size} className={`text-slate-400 ${className}`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={`text-cyan-300 ${className}`} />;
    case 'CloudRain':
      return <CloudRain size={size} className={`text-blue-400 animate-bounce-subtle ${className}`} />;
    case 'CloudRainWind':
      return <CloudRainWind size={size} className={`text-blue-500 animate-bounce-subtle ${className}`} />;
    case 'CloudHail':
      return <CloudHail size={size} className={`text-cyan-200 ${className}`} />;
    case 'Snowflake':
      return <Snowflake size={size} className={`text-cyan-100 animate-pulse ${className}`} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={`text-amber-300 animate-pulse ${className}`} />;
    default:
      return <CloudSun size={size} className={`text-sky-300 ${className}`} />;
  }
};
