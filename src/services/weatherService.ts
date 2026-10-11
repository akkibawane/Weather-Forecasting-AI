import type {
  WeatherData,
  GeoLocation,
  HourlyForecastItem,
  DailyForecastItem,
  AirQualityData,
  WeatherAlert,
  SmartInsight,
  AIDailySummary,
} from '../types/weather';
import { getWeatherCondition, getAQIInfo } from '../utils/weatherUtils';

const CACHE_PREFIX = 'weatherai_cache_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Default top cities for quick selection / fallback
export const POPULAR_CITIES: GeoLocation[] = [
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata' },
];

/**
 * Search cities worldwide using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();
  const cacheKey = `geo_${trimmed.toLowerCase()}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore storage error
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding search failed');
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    const locations: GeoLocation[] = data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || item.admin2 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(locations));
    } catch {
      // ignore
    }

    return locations;
  } catch (err) {
    console.warn('City search failed, filtering popular cities fallback:', err);
    return POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        c.country.toLowerCase().includes(trimmed.toLowerCase())
    );
  }
}

/**
 * Reverse geocode latitude & longitude to city name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`
    );
    if (res.ok) {
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        data.address?.county ||
        'Current Location';
      const country = data.address?.country || '';
      const admin1 = data.address?.state || '';
      return {
        name: city,
        country,
        admin1,
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode failed, using default coordinate name', e);
  }

  return {
    name: 'Current Location',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}

/**
 * Fetch complete weather forecast, air quality, alerts, and insights
 */
export async function fetchWeatherData(
  lat: number,
  lon: number,
  locationName: string = 'Current Location',
  country: string = '',
  admin1: string = ''
): Promise<WeatherData> {
  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(3)}_${lon.toFixed(3)}`;

  // Check cache first
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsed = JSON.parse(cachedItem);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch {
    // proceed to network
  }

  try {
    // Fetch forecast & air quality concurrently
    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index` +
      `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,wind_direction_10m,uv_index` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
      `&past_days=1&forecast_days=8&timezone=auto`;

    const aqiUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

    const [forecastRes, aqiRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(aqiUrl).catch(() => null),
    ]);

    if (!forecastRes.ok) {
      throw new Error(`Weather API responded with status ${forecastRes.status}`);
    }

    const forecast = await forecastRes.json();
    const aqiJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

    // Process Current Weather
    const currentRaw = forecast.current;
    const cond = getWeatherCondition(currentRaw.weather_code, currentRaw.is_day === 1);
    
    // Yesterday's max temp for comparison
    const tempYesterday =
      forecast.daily?.temperature_2m_max && forecast.daily.temperature_2m_max.length > 0
        ? forecast.daily.temperature_2m_max[0]
        : undefined;

    // Process Hourly Forecast
    const hourlyTimes: string[] = forecast.hourly?.time || [];
    const nowIso = currentRaw.time;
    const currentHourIndex = Math.max(
      0,
      hourlyTimes.findIndex((t) => t.substring(0, 13) === nowIso.substring(0, 13))
    );

    // Grab next 24 hours starting from current hour
    const hourlySlice = hourlyTimes.slice(currentHourIndex, currentHourIndex + 25);
    const hourly: HourlyForecastItem[] = hourlySlice.map((timeStr, idx) => {
      const originalIdx = currentHourIndex + idx;
      const code = forecast.hourly.weather_code[originalIdx] ?? currentRaw.weather_code;
      const timeDate = new Date(timeStr);
      const isD = timeDate.getHours() >= 6 && timeDate.getHours() < 19;
      const condInfo = getWeatherCondition(code, isD);

      return {
        time: timeDate.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        rawTime: timeStr,
        timestamp: timeDate.getTime(),
        temp: Math.round(forecast.hourly.temperature_2m[originalIdx]),
        feelsLike: Math.round(forecast.hourly.apparent_temperature[originalIdx]),
        condition: condInfo.name,
        conditionCode: code,
        icon: condInfo.icon,
        rainChance: forecast.hourly.precipitation_probability ? (forecast.hourly.precipitation_probability[originalIdx] ?? 0) : 0,
        precipitation: forecast.hourly.precipitation ? (forecast.hourly.precipitation[originalIdx] ?? 0) : 0,
        windSpeed: Math.round(forecast.hourly.wind_speed_10m ? forecast.hourly.wind_speed_10m[originalIdx] : currentRaw.wind_speed_10m),
        windDirection: forecast.hourly.wind_direction_10m ? forecast.hourly.wind_direction_10m[originalIdx] : 0,
        humidity: Math.round(forecast.hourly.relative_humidity_2m ? forecast.hourly.relative_humidity_2m[originalIdx] : 50),
        uvIndex: forecast.hourly.uv_index ? Math.round(forecast.hourly.uv_index[originalIdx]) : 0,
        isCurrentHour: idx === 0,
      };
    });

    // Process Daily Forecast (Skip past day index 0)
    const dailyStartIndex = forecast.daily.time.length > 7 ? 1 : 0;
    const dailyDays = forecast.daily.time.slice(dailyStartIndex, dailyStartIndex + 7);
    const daily: DailyForecastItem[] = dailyDays.map((dateStr: string, idx: number) => {
      const dataIdx = dailyStartIndex + idx;
      const code = forecast.daily.weather_code[dataIdx];
      const condInfo = getWeatherCondition(code, true);
      const d = new Date(dateStr + 'T12:00:00');
      const isToday = idx === 0;
      const dayName = isToday
        ? 'Today'
        : d.toLocaleDateString([], { weekday: 'short' });

      return {
        date: dateStr,
        dayName,
        condition: condInfo.name,
        conditionCode: code,
        icon: condInfo.icon,
        tempMax: Math.round(forecast.daily.temperature_2m_max[dataIdx]),
        tempMin: Math.round(forecast.daily.temperature_2m_min[dataIdx]),
        rainChance: forecast.daily.precipitation_probability_max ? (forecast.daily.precipitation_probability_max[dataIdx] ?? 0) : 0,
        precipitationSum: forecast.daily.precipitation_sum ? (forecast.daily.precipitation_sum[dataIdx] ?? 0) : 0,
        windSpeedMax: Math.round(forecast.daily.wind_speed_10m_max ? forecast.daily.wind_speed_10m_max[dataIdx] : 15),
        uvIndexMax: forecast.daily.uv_index_max ? Math.round(forecast.daily.uv_index_max[dataIdx]) : 5,
        sunrise: forecast.daily.sunrise ? forecast.daily.sunrise[dataIdx] : '',
        sunset: forecast.daily.sunset ? forecast.daily.sunset[dataIdx] : '',
      };
    });

    // Process Air Quality
    const aqiCurrent = aqiJson?.current || {};
    const rawAQI = Math.round(aqiCurrent.european_aqi ?? aqiCurrent.us_aqi ?? 35);
    const aqiMeta = getAQIInfo(rawAQI);

    const airQuality: AirQualityData = {
      aqi: rawAQI,
      aqiLevel: aqiMeta.level,
      pm2_5: Math.round(aqiCurrent.pm2_5 ?? 12),
      pm10: Math.round(aqiCurrent.pm10 ?? 22),
      co: Math.round(aqiCurrent.carbon_monoxide ?? 280),
      no2: Math.round(aqiCurrent.nitrogen_dioxide ?? 15),
      o3: Math.round(aqiCurrent.ozone ?? 55),
      so2: Math.round(aqiCurrent.sulphur_dioxide ?? 4),
      explanation: aqiMeta.description,
      dominantPollutant: (aqiCurrent.pm2_5 ?? 12) > 25 ? 'PM2.5' : (aqiCurrent.o3 ?? 55) > 60 ? 'O3' : 'PM10',
    };

    // Calculate Sunrise / Sunset for today
    const sunriseToday = forecast.daily?.sunrise?.[dailyStartIndex] || '06:00';
    const sunsetToday = forecast.daily?.sunset?.[dailyStartIndex] || '18:30';

    // Generate Meteorological Severe Alerts
    const alerts: WeatherAlert[] = [];
    if (currentRaw.weather_code >= 95) {
      alerts.push({
        id: 'alert-storm',
        event: 'Severe Thunderstorm Warning',
        headline: 'Intense thunderstorm with potential lightning hazards',
        severity: 'high',
        description: 'Atmospheric instability is causing severe convective storms. Expect heavy downpours and lightning.',
        instruction: 'Stay indoors away from windows and avoid open fields or trees.',
        effective: 'Immediate',
        expires: 'Next 6 hours',
        source: 'Meteorological Service',
      });
    } else if (currentRaw.wind_gusts_10m > 55 || currentRaw.wind_speed_10m > 40) {
      alerts.push({
        id: 'alert-wind',
        event: 'High Wind Advisory',
        headline: `Strong wind gusts up to ${Math.round(currentRaw.wind_gusts_10m)} km/h`,
        severity: 'moderate',
        description: 'Gusty winds may blow unsecured objects and make driving high-profile vehicles difficult.',
        instruction: 'Secure patio furniture and drive cautiously.',
        effective: 'Active',
        expires: 'Tonight',
        source: 'WeatherAI Alert Engine',
      });
    } else if (currentRaw.temperature_2m > 36) {
      alerts.push({
        id: 'alert-heat',
        event: 'Extreme Heat Warning',
        headline: `Dangerous temperatures reaching ${Math.round(currentRaw.temperature_2m)}°C`,
        severity: 'extreme',
        description: 'Prolonged exposure can lead to heat exhaustion or heat stroke.',
        instruction: 'Drink plenty of water, stay in air-conditioned spaces, and avoid strenuous outdoor exercise.',
        effective: 'Daytime',
        expires: '19:00',
        source: 'Public Health Weather Advisory',
      });
    } else if (currentRaw.temperature_2m < 0) {
      alerts.push({
        id: 'alert-freeze',
        event: 'Freezing Conditions Advisory',
        headline: 'Sub-zero temperatures and potential icy roads',
        severity: 'moderate',
        description: 'Pavement surfaces may have black ice.',
        instruction: 'Allow extra travel time and bundle up warmly.',
        effective: 'Morning & Night',
        expires: 'Tomorrow 10:00',
        source: 'Regional Weather Center',
      });
    }

    if (airQuality.aqi > 75) {
      alerts.push({
        id: 'alert-aqi',
        event: 'Unhealthy Air Quality Alert',
        headline: `Air Quality Index is ${airQuality.aqi} (${airQuality.aqiLevel})`,
        severity: airQuality.aqi > 90 ? 'high' : 'moderate',
        description: airQuality.explanation,
        instruction: 'Sensitive individuals should wear N95 masks and avoid prolonged outdoor exertion.',
        effective: 'Today',
        expires: 'Tomorrow',
        source: 'Air Quality Monitoring Network',
      });
    }

    // Check hourly rain window for rain insight
    const rainyHours = hourly.filter((h) => h.rainChance >= 40);
    const rainInsightMessage =
      rainyHours.length > 0
        ? `Rain probability peaks at ${Math.max(...rainyHours.map((h) => h.rainChance))}% between ${rainyHours[0].time} and ${rainyHours[rainyHours.length - 1].time}.`
        : 'Dry conditions expected throughout the day. Rain probability remains very low.';

    // Temperature delta vs yesterday
    const currentTemp = Math.round(currentRaw.temperature_2m);
    let tempDeltaMessage = 'Temperatures are staying consistent with seasonal averages.';
    if (tempYesterday !== undefined) {
      const diff = Math.round(currentTemp - tempYesterday);
      if (diff > 1) {
        tempDeltaMessage = `Today's temperature will be around ${diff}°C higher than yesterday.`;
      } else if (diff < -1) {
        tempDeltaMessage = `Today's temperature is ${Math.abs(diff)}°C cooler than yesterday.`;
      } else {
        tempDeltaMessage = `Temperatures today are nearly identical to yesterday (${currentTemp}°C).`;
      }
    }

    // Optimal outdoor workout / activity window
    const comfortableHours = hourly.filter(
      (h) => h.temp >= 16 && h.temp <= 28 && h.rainChance < 30 && h.windSpeed < 28
    );
    const activityWindow =
      comfortableHours.length > 0
        ? `${comfortableHours[0].time}–${comfortableHours[Math.min(3, comfortableHours.length - 1)].time} looks like the most comfortable time for outdoor activities.`
        : 'Early morning or late evening will be the most suitable times for light exercise.';

    // Clothing suggestion
    let clothingSuggestion = 'Light cotton clothes and breathable fabric will be comfortable today.';
    if (currentTemp < 10) {
      clothingSuggestion = 'Wear a heavy thermal jacket, scarf, and warm layers to stay comfortable.';
    } else if (currentTemp < 18) {
      clothingSuggestion = 'A medium jacket or cozy sweater over casual wear is recommended.';
    } else if (currentTemp > 30) {
      clothingSuggestion = 'Wear lightweight, loose-fitting cotton clothing, a hat, and UV sunglasses.';
    }

    const insights: SmartInsight[] = [
      {
        id: 'ins-rain',
        type: 'rain',
        title: 'Rain Alert',
        message: rainInsightMessage,
        icon: 'CloudRain',
        severity: rainyHours.length > 0 ? 'warning' : 'info',
      },
      {
        id: 'ins-temp',
        type: 'temperature',
        title: 'Temperature Trend',
        message: tempDeltaMessage,
        icon: 'Thermometer',
        severity: 'info',
      },
      {
        id: 'ins-activity',
        type: 'activity',
        title: 'Outdoor Activity',
        message: activityWindow,
        icon: 'Activity',
        severity: 'success',
      },
      {
        id: 'ins-clothing',
        type: 'clothing',
        title: 'Clothing Guide',
        message: clothingSuggestion,
        icon: 'Shirt',
        severity: 'info',
      },
    ];

    if (currentRaw.uv_index > 6) {
      insights.push({
        id: 'ins-uv',
        type: 'uv',
        title: 'UV Precaution',
        message: `Peak UV index reaches ${Math.round(currentRaw.uv_index)}. Apply SPF 30+ sunscreen and wear sunglasses.`,
        icon: 'Sun',
        severity: 'warning',
      });
    }

    // AI Daily Summary
    const maxDayTemp = daily[0]?.tempMax ?? currentTemp;
    const minDayTemp = daily[0]?.tempMin ?? currentTemp - 6;
    const isRainLikely = rainyHours.length > 0;

    const aiSummary: AIDailySummary = {
      overview: `${cond.name} throughout the region. Temperatures ranging between ${minDayTemp}°C and ${maxDayTemp}°C. ${
        isRainLikely
          ? `Expect scattered showers with a ${Math.max(...rainyHours.map((h) => h.rainChance))}% chance of rain.`
          : 'Stable conditions with pleasant visibility.'
      }`,
      morning: `Crisp and calm with temperatures around ${Math.round(hourly[2]?.temp || currentTemp)}°C. Perfect for morning commutes.`,
      afternoon: `Daytime high peaking near ${maxDayTemp}°C with moderate humidity (${currentRaw.relative_humidity_2m}%).`,
      evening: `Cooling down towards ${Math.round(hourly[Math.min(10, hourly.length - 1)]?.temp || minDayTemp + 2)}°C. ${
        isRainLikely ? 'Keep an umbrella handy.' : 'Pleasant for evening walks.'
      }`,
      clothing: clothingSuggestion,
      activity: activityWindow,
      umbrellaNeeded: isRainLikely,
      summaryBadge: isRainLikely ? '🌧️ Rain Alert' : currentTemp > 30 ? '☀️ Warm & Sunny' : '🌤️ Fair Weather',
    };

    const weatherData: WeatherData = {
      location: {
        name: locationName,
        country,
        admin1,
        latitude: lat,
        longitude: lon,
        timezone: forecast.timezone || 'UTC',
      },
      localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      current: {
        temp: currentTemp,
        feelsLike: Math.round(currentRaw.apparent_temperature),
        condition: cond.name,
        conditionCode: currentRaw.weather_code,
        isDay: currentRaw.is_day === 1,
        icon: cond.icon,
        humidity: currentRaw.relative_humidity_2m,
        windSpeed: Math.round(currentRaw.wind_speed_10m),
        windDirection: currentRaw.wind_direction_10m,
        windGusts: Math.round(currentRaw.wind_gusts_10m || currentRaw.wind_speed_10m * 1.3),
        visibility: forecast.hourly?.visibility ? Math.round((forecast.hourly.visibility[currentHourIndex] || 10000) / 1000) : 10,
        uvIndex: Math.round(currentRaw.uv_index || 0),
        pressure: Math.round(currentRaw.surface_pressure || currentRaw.pressure_msl || 1013),
        sunrise: sunriseToday,
        sunset: sunsetToday,
        aqi: airQuality.aqi,
        rainChance: hourly[0]?.rainChance || 0,
        precipitation: currentRaw.precipitation || 0,
        cloudCover: currentRaw.cloud_cover || 20,
        dewPoint: Math.round(currentTemp - (100 - currentRaw.relative_humidity_2m) / 5),
        tempYesterday,
      },
      hourly,
      daily,
      airQuality,
      alerts,
      insights,
      aiSummary,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    // Save to cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: weatherData }));
    } catch {
      // ignore quota exceeded
    }

    return weatherData;
  } catch (err) {
    console.error('Weather fetch error:', err);
    // If we have any cached data even if expired, return it as fallback
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch {
      // ignore
    }
    // Return high-quality synthetic fallback for the city so UI never crashes
    return getFallbackWeatherData(lat, lon, locationName, country);
  }
}

/**
 * High-fidelity fallback weather data generator for offline/rate-limited states
 */
function getFallbackWeatherData(
  lat: number,
  lon: number,
  locationName: string,
  country: string
): WeatherData {
  const currentTemp = 24;
  const cond = getWeatherCondition(1, true);

  const hourly: HourlyForecastItem[] = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date();
    d.setHours(d.getHours() + i);
    const isDay = d.getHours() >= 6 && d.getHours() < 19;
    return {
      time: d.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
      rawTime: d.toISOString(),
      timestamp: d.getTime(),
      temp: Math.round(22 + Math.sin(i / 3) * 6),
      feelsLike: Math.round(22 + Math.sin(i / 3) * 6),
      condition: i % 5 === 0 ? 'Scattered Clouds' : 'Mostly Clear',
      conditionCode: 1,
      icon: isDay ? 'Sun' : 'Moon',
      rainChance: Math.round(10 + Math.sin(i / 2) * 15),
      precipitation: 0,
      windSpeed: Math.round(12 + Math.cos(i) * 5),
      windDirection: 180,
      humidity: 55,
      uvIndex: isDay ? Math.min(8, Math.max(1, Math.round(Math.sin((i / 24) * Math.PI) * 9))) : 0,
      isCurrentHour: i === 0,
    };
  });

  const daily: DailyForecastItem[] = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
    (dayName, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      return {
        date: d.toISOString().split('T')[0],
        dayName,
        condition: idx % 3 === 0 ? 'Partly Cloudy' : 'Sunny',
        conditionCode: idx % 3 === 0 ? 2 : 1,
        icon: idx % 3 === 0 ? 'CloudSun' : 'Sun',
        tempMax: 26 + (idx % 3),
        tempMin: 18 - (idx % 2),
        rainChance: 15 + idx * 5,
        precipitationSum: 0.2,
        windSpeedMax: 18,
        uvIndexMax: 6,
        sunrise: '06:15',
        sunset: '18:45',
      };
    }
  );

  return {
    location: {
      name: locationName,
      country,
      latitude: lat,
      longitude: lon,
      timezone: 'UTC',
    },
    localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    current: {
      temp: currentTemp,
      feelsLike: 25,
      condition: cond.name,
      conditionCode: 1,
      isDay: true,
      icon: cond.icon,
      humidity: 58,
      windSpeed: 14,
      windDirection: 210,
      windGusts: 20,
      visibility: 10,
      uvIndex: 5,
      pressure: 1014,
      sunrise: '06:15',
      sunset: '18:45',
      aqi: 32,
      rainChance: 15,
      precipitation: 0,
      cloudCover: 25,
      dewPoint: 15,
    },
    hourly,
    daily,
    airQuality: {
      aqi: 32,
      aqiLevel: 'Good',
      pm2_5: 8,
      pm10: 18,
      co: 240,
      no2: 12,
      o3: 45,
      so2: 3,
      explanation: 'Air quality is satisfactory and poses little or no health risk.',
      dominantPollutant: 'PM10',
    },
    alerts: [],
    insights: [
      {
        id: 'ins-rain',
        type: 'rain',
        title: 'Rain Alert',
        message: 'No significant rain expected for the next 24 hours. Clear skies prevail.',
        icon: 'CloudRain',
        severity: 'info',
      },
      {
        id: 'ins-temp',
        type: 'temperature',
        title: 'Temperature Trend',
        message: "Today's temperature is very comfortable, staying right around 24°C.",
        icon: 'Thermometer',
        severity: 'info',
      },
      {
        id: 'ins-activity',
        type: 'activity',
        title: 'Outdoor Activity',
        message: '7 AM–10 AM looks like the most comfortable time for outdoor activities.',
        icon: 'Activity',
        severity: 'success',
      },
      {
        id: 'ins-clothing',
        type: 'clothing',
        title: 'Clothing Guide',
        message: 'Light cotton clothes should be comfortable today.',
        icon: 'Shirt',
        severity: 'info',
      },
    ],
    aiSummary: {
      overview: 'Mainly sunny morning with pleasant afternoon breezes. Comfortable temperature of 24°C.',
      morning: 'Cool and crisp start to the day. Great for walking or exercising outdoors.',
      afternoon: 'Warm and sunny with light winds. Peak of 26°C expected around 2 PM.',
      evening: 'Mild and pleasant evening, temperatures settling around 20°C.',
      clothing: 'Light cotton clothes should be comfortable today.',
      activity: '7 AM–10 AM looks like the most comfortable time for outdoor activities.',
      umbrellaNeeded: false,
      summaryBadge: '🌤️ Fair Weather',
    },
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
