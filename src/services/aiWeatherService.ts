import type { WeatherData } from '../types/weather';

/**
 * Intelligent Weather Assistant reasoning engine
 */
export async function answerWeatherQuestion(
  question: string,
  weather: WeatherData,
  userGeminiKey?: string
): Promise<string> {
  const q = question.trim().toLowerCase();

  // If user provided a Gemini API Key or env variable is set, attempt Gemini API call
  const apiKey = userGeminiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const geminiResponse = await queryGeminiAPI(question, weather, apiKey);
      if (geminiResponse) return geminiResponse;
    } catch (e) {
      console.warn('Gemini API call failed, switching to offline meteorological engine', e);
    }
  }

  // Built-in Meteorological AI Engine
  return executeMeteorologicalReasoning(q, weather);
}

/**
 * Direct Gemini 1.5/2.0 API caller with structured weather prompt
 */
async function queryGeminiAPI(question: string, weather: WeatherData, apiKey: string): Promise<string> {
  const systemPrompt = `You are WeatherAI, a smart, practical meteorologist assistant.
Context:
Location: ${weather.location.name}, ${weather.location.country}
Current: ${weather.current.temp}°C, feels like ${weather.current.feelsLike}°C, condition: ${weather.current.condition}
Humidity: ${weather.current.humidity}%, Wind: ${weather.current.windSpeed} km/h, UV: ${weather.current.uvIndex}, AQI: ${weather.airQuality.aqi} (${weather.airQuality.aqiLevel})
Hourly highlights: ${weather.hourly.slice(0, 12).map(h => `${h.time}: ${h.temp}°C, ${h.condition}, Rain: ${h.rainChance}%`).join('; ')}
Daily high/low: ${weather.daily[0]?.tempMax}°C / ${weather.daily[0]?.tempMin}°C
Alerts: ${weather.alerts.length > 0 ? weather.alerts.map(a => a.event).join(', ') : 'None'}

Instructions:
- Provide a direct, practical, and friendly answer.
- Keep it concise (2-4 sentences max), avoid unnecessary filler.
- Mention specific times and probabilities when relevant.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${question}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API error ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || '';
}

/**
 * High-precision Meteorological Heuristic Engine
 */
function executeMeteorologicalReasoning(q: string, weather: WeatherData): string {
  const current = weather.current;
  const hourly = weather.hourly;
  const daily = weather.daily;
  const location = weather.location.name;

  // 1. Specific time inquiry (e.g. "6 PM", "7 AM", "3:00 PM", "noon", "tonight", "afternoon")
  const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch && (q.includes('ride') || q.includes('go') || q.includes('weather') || q.includes('at') || q.includes('rain') || q.includes('walk') || q.includes('bike'))) {
    let targetHour = parseInt(timeMatch[1], 10);
    const meridiem = timeMatch[3]?.toLowerCase();
    if (meridiem === 'pm' && targetHour < 12) targetHour += 12;
    if (meridiem === 'am' && targetHour === 12) targetHour = 0;

    // Find hourly slice matching target hour
    const matchedHour = hourly.find((h) => {
      const hourVal = new Date(h.rawTime).getHours();
      return hourVal === targetHour;
    });

    if (matchedHour) {
      const rainChance = matchedHour.rainChance;
      const temp = matchedHour.temp;
      const cond = matchedHour.condition.toLowerCase();
      const wind = matchedHour.windSpeed;

      if (rainChance >= 60) {
        return `At ${matchedHour.time}, expect ${cond} with a high ${rainChance}% chance of rain and ${temp}°C. It would be best to reschedule outdoor plans or bring sturdy rain gear.`;
      } else if (rainChance >= 25) {
        return `${matchedHour.time} looks ${cond} with a ${rainChance}% chance of rain, winds at ${wind} km/h, and ${temp}°C. It should be generally comfortable, but carrying a light rain jacket would be a good idea.`;
      } else {
        return `${matchedHour.time} is looking great: ${cond}, ${temp}°C, with only a ${rainChance}% chance of rain and gentle winds (${wind} km/h). Excellent conditions to be outside!`;
      }
    }
  }

  // 2. Umbrella / Rain Question
  if (q.includes('umbrella') || q.includes('rain') || q.includes('drizzle') || q.includes('showers')) {
    const rainyHours = hourly.filter((h) => h.rainChance >= 35);
    const peakRain = rainyHours.length > 0 ? Math.max(...rainyHours.map((h) => h.rainChance)) : current.rainChance;

    if (rainyHours.length > 0) {
      const firstRainTime = rainyHours[0].time;
      const lastRainTime = rainyHours[rainyHours.length - 1].time;
      return `Yes, you should definitely keep an umbrella with you today in ${location}. Rain probability reaches ${peakRain}% mainly between ${firstRainTime} and ${lastRainTime}.`;
    } else if (current.rainChance > 20) {
      return `There is only a slight chance of light showers (${current.rainChance}%) today. An umbrella is unlikely to be essential, but having a compact one in your bag won't hurt.`;
    } else {
      return `No umbrella needed today in ${location}! Skies are looking mostly dry with less than a 15% chance of precipitation throughout the day.`;
    }
  }

  // 3. Outdoor activity / Sports / Running / Cycling
  if (q.includes('outdoor') || q.includes('activity') || q.includes('run') || q.includes('walk') || q.includes('bike') || q.includes('exercise') || q.includes('park')) {
    const comfortableHours = hourly.filter(
      (h) => h.temp >= 16 && h.temp <= 28 && h.rainChance < 25 && h.windSpeed < 30
    );

    if (weather.alerts.length > 0 && weather.alerts.some((a) => a.severity === 'high' || a.severity === 'extreme')) {
      return `Outdoor activities are not recommended today due to active alerts: ${weather.alerts[0].headline}. Please prioritize staying indoors.`;
    }

    if (comfortableHours.length > 0) {
      const start = comfortableHours[0].time;
      const end = comfortableHours[Math.min(3, comfortableHours.length - 1)].time;
      return `Yes, today has good windows for outdoor activities! The prime window is around ${start}–${end}, when temperatures are near ${comfortableHours[0].temp}°C with low rain risk and mild winds.`;
    } else if (current.temp > 32) {
      return `It will be quite hot today (${current.temp}°C). If you do outdoor exercise, plan it for early morning before 8 AM or after sunset, and stay well hydrated.`;
    } else if (current.temp < 10) {
      return `Outdoor activity is fine if you dress warmly, but temperatures will be chilly around ${current.temp}°C. Midday will be the warmest period.`;
    } else {
      return `Outdoor conditions are moderate. Keep an eye on local clouds and plan activities before any late afternoon shifts.`;
    }
  }

  // 4. Clothing / What to wear
  if (q.includes('wear') || q.includes('cloth') || q.includes('jacket') || q.includes('dress') || q.includes('outfit')) {
    const temp = current.temp;
    const isRain = hourly.some((h) => h.rainChance > 40);

    if (temp < 8) {
      return `Bundle up warmly! Wear a heavy winter coat, thermal inner layers, a scarf, and warm gloves. ${isRain ? 'Make sure your outer coat is waterproof.' : ''}`;
    } else if (temp < 16) {
      return `A comfortable jacket, sweater, or layered fleece over long sleeves will keep you cozy today. ${isRain ? 'Bring a waterproof jacket or umbrella as well.' : ''}`;
    } else if (temp < 24) {
      return `Comfortable casual clothes like jeans and a light shirt or light cardigan will be ideal. The weather feels mild at ${temp}°C.`;
    } else if (temp < 31) {
      return `Lightweight, breathable cotton or linen clothing is recommended. Sunglasses and a sun hat will be helpful if you are outside.`;
    } else {
      return `Extremely light and loose-fitting clothing is best today as it reaches ${temp}°C. Don't forget sunscreen and UV sunglasses!`;
    }
  }

  // 5. Travel safety / Driving / Flight
  if (q.includes('travel') || q.includes('safe') || q.includes('drive') || q.includes('flight') || q.includes('road')) {
    if (weather.alerts.length > 0) {
      return `Exercise caution when traveling: ${weather.alerts[0].headline}. Roads may be slippery and visibility reduced. Allow extra transit time.`;
    }
    if (current.windSpeed > 45) {
      return `Winds are quite gusty at ${current.windSpeed} km/h. Drive cautiously, especially on open highways and bridges.`;
    }
    if (current.visibility < 3) {
      return `Visibility is currently low (${current.visibility} km) due to fog or mist. Use low-beam headlights and maintain safe following distances.`;
    }
    return `Travel conditions in ${location} look smooth and safe today. Roads are clear, visibility is around ${current.visibility} km, and winds are moderate (${current.windSpeed} km/h).`;
  }

  // 6. Tomorrow vs Today comparison
  if (q.includes('tomorrow') || q.includes('hotter') || q.includes('colder') || q.includes('warmer')) {
    const todayMax = daily[0]?.tempMax ?? current.temp;
    const tomorrowMax = daily[1]?.tempMax ?? todayMax;
    const tomorrowCond = daily[1]?.condition || 'pleasant';
    const diff = tomorrowMax - todayMax;

    if (Math.abs(diff) <= 1) {
      return `Tomorrow will feel very similar to today, reaching around ${tomorrowMax}°C with ${tomorrowCond}.`;
    } else if (diff > 1) {
      return `Yes, tomorrow will be warmer than today by about ${diff}°C, reaching a high of ${tomorrowMax}°C with ${tomorrowCond}.`;
    } else {
      return `No, tomorrow will be cooler by about ${Math.abs(diff)}°C, with a high of ${tomorrowMax}°C and ${tomorrowCond}.`;
    }
  }

  // 7. Best time to go outside
  if (q.includes('best time') || q.includes('when to go') || q.includes('ideal time') || q.includes('outside')) {
    const comfortable = hourly.slice(0, 18).filter((h) => h.rainChance < 25 && h.temp >= 18 && h.temp <= 28);
    if (comfortable.length > 0) {
      return `The best time to go outside today in ${location} is between ${comfortable[0].time} and ${comfortable[Math.min(3, comfortable.length - 1)].time}. You'll enjoy comfortable temperatures (${comfortable[0].temp}°C) and zero rain disruption.`;
    }
    return `Early morning (7 AM–9 AM) or late afternoon (after 5 PM) will offer the most pleasant conditions to step outside.`;
  }

  // 8. Weekly summary
  if (q.includes('week') || q.includes('7-day') || q.includes('forecast') || q.includes('summary')) {
    const highAvg = Math.round(daily.reduce((sum, d) => sum + d.tempMax, 0) / daily.length);
    const lowAvg = Math.round(daily.reduce((sum, d) => sum + d.tempMin, 0) / daily.length);
    const rainyDays = daily.filter((d) => d.rainChance > 40);

    return `This week in ${location}, expect daily highs averaging ${highAvg}°C and overnight lows around ${lowAvg}°C. ${
      rainyDays.length > 0
        ? `Rain is most likely on ${rainyDays.map((d) => d.dayName).join(' and ')}.`
        : 'The week ahead looks largely settled with plenty of fair weather.'
    }`;
  }

  // 9. Air quality
  if (q.includes('air') || q.includes('aqi') || q.includes('pollution') || q.includes('smog')) {
    return `Air quality in ${location} is currently ${weather.airQuality.aqiLevel} with an AQI of ${weather.airQuality.aqi}. ${weather.airQuality.explanation}`;
  }

  // General default helpful summary
  return `Currently in ${location}, it is ${current.temp}°C (${current.condition}) with ${current.humidity}% humidity and ${current.windSpeed} km/h wind. Today's high will reach ${daily[0]?.tempMax}°C with a ${current.rainChance}% chance of rain. Let me know if you need outfit, activity, or timing tips!`;
}
