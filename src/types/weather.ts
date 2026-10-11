export type TempUnit = 'C' | 'F';
export type SpeedUnit = 'km/h' | 'mph' | 'm/s';
export type TimeFormat = '12h' | '24h';
export type ThemeMode =
  | 'aurora'
  | 'midnight'
  | 'sunset'
  | 'cyberpunk'
  | 'obsidian'
  | 'dark'
  | 'light'
  | 'auto';

export interface WeatherUnits {
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  timeFormat: TimeFormat;
}

export interface GeoLocation {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isFavorite?: boolean;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  isDay: boolean;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  visibility: number;
  uvIndex: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  aqi: number;
  rainChance: number;
  precipitation: number;
  cloudCover: number;
  dewPoint: number;
  tempYesterday?: number;
}

export interface HourlyForecastItem {
  time: string;
  rawTime: string;
  timestamp: number;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  icon: string;
  rainChance: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  uvIndex: number;
  isCurrentHour: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  condition: string;
  conditionCode: number;
  icon: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  precipitationSum: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  aqi: number;
  aqiLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
  explanation: string;
  dominantPollutant: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
  instruction: string;
  effective: string;
  expires: string;
  source: string;
}

export interface SmartInsight {
  id: string;
  type: 'rain' | 'temperature' | 'activity' | 'clothing' | 'uv' | 'wind';
  title: string;
  message: string;
  icon: string;
  severity?: 'info' | 'warning' | 'alert' | 'success';
}

export interface AIDailySummary {
  overview: string;
  morning: string;
  afternoon: string;
  evening: string;
  clothing: string;
  activity: string;
  umbrellaNeeded: boolean;
  summaryBadge: string;
}

export interface WeatherData {
  location: GeoLocation;
  localTime: string;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  alerts: WeatherAlert[];
  insights: SmartInsight[];
  aiSummary: AIDailySummary;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}
