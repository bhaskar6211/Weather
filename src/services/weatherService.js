const weatherCodeMap = {
  0: { label: 'Clear Sky', description: 'Bright and calm conditions', icon: '☀️' },
  1: { label: 'Mainly Clear', description: 'Mostly sunny with a few clouds', icon: '🌤️' },
  2: { label: 'Partly Cloudy', description: 'A mix of sun and cloud cover', icon: '⛅' },
  3: { label: 'Overcast', description: 'Cloud cover dominates the sky', icon: '☁️' },
  45: { label: 'Fog', description: 'Low visibility in foggy air', icon: '🌫️' },
  48: { label: 'Rime Fog', description: 'Fog with frozen moisture', icon: '🌫️' },
  51: { label: 'Light Drizzle', description: 'A light drizzle is moving through', icon: '🌦️' },
  53: { label: 'Drizzle', description: 'Steady drizzle through the area', icon: '🌧️' },
  55: { label: 'Dense Drizzle', description: 'Persistent drizzle and damp air', icon: '🌧️' },
  61: { label: 'Light Rain', description: 'Light rain is expected', icon: '🌧️' },
  63: { label: 'Rain', description: 'Regular rainfall in progress', icon: '🌧️' },
  65: { label: 'Heavy Rain', description: 'Heavier rain with reduced comfort', icon: '🌧️' },
  71: { label: 'Light Snow', description: 'Light snow showers in the area', icon: '🌨️' },
  80: { label: 'Rain Showers', description: 'Brief rain showers will continue', icon: '🌦️' },
  81: { label: 'Rain Showers', description: 'Frequent rain showers expected', icon: '🌦️' },
  82: { label: 'Heavy Showers', description: 'Stronger shower activity nearby', icon: '⛈️' },
  95: { label: 'Thunderstorm', description: 'Thunderstorm activity nearby', icon: '⛈️' },
  default: { label: 'Weather Update', description: 'Live weather conditions available', icon: '🌍' },
};

export const presetCities = ['London', 'Tokyo', 'Seattle'];

export function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

export function toMph(kph) {
  return Math.round(kph * 0.621371);
}

function formatLocationLabel(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function getWeatherDetails(code, isDay) {
  const details = weatherCodeMap[code] || weatherCodeMap.default;

  if (code === 0 && !isDay) {
    return { ...details, label: 'Clear Night', description: 'Clear skies and a calm night', icon: '🌙' };
  }

  if (code === 1 && !isDay) {
    return { ...details, label: 'Mostly Clear Night', description: 'Mostly clear with some cloud cover', icon: '🌙' };
  }

  return details;
}

function getConditionGroup(code) {
  if (code === 0 || code === 1) {
    return 'Clear';
  }

  if ([2, 3, 45, 48, 71].includes(code)) {
    return 'Cloudy';
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) {
    return 'Rainy';
  }

  return 'Cloudy';
}

function formatTime(timeValue) {
  const date = new Date(timeValue);

  if (Number.isNaN(date.getTime())) {
    return 'Now';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDayLabel(dateValue, index) {
  if (index === 0) {
    return 'Today';
  }

  if (index === 1) {
    return 'Tomorrow';
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(new Date(`${dateValue}T12:00:00`));
}

function getAqiDetails(aqiValue) {
  if (typeof aqiValue !== 'number' || Number.isNaN(aqiValue)) {
    return {
      value: null,
      level: 'Unavailable',
      message: 'Air quality data is not available right now.',
    };
  }

  if (aqiValue <= 50) {
    return {
      value: aqiValue,
      level: 'Good',
      message: 'Air quality is satisfactory for most people. Outdoor activity is fine.',
    };
  }

  if (aqiValue <= 100) {
    return {
      value: aqiValue,
      level: 'Moderate',
      message: 'Sensitive groups should reduce prolonged outdoor exertion.',
    };
  }

  return {
    value: aqiValue,
    level: 'Unhealthy',
    message: 'Limit outdoor activity and reduce exposure, especially if you have respiratory conditions.',
  };
}

function getMoonPhaseLabel(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable';
  }

  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const synodicMonth = 29.53058867;
  const age = (((date.getTime() - knownNewMoon) / 86400000) % synodicMonth + synodicMonth) % synodicMonth;

  if (age < 1.84566) {
    return 'New Moon';
  }

  if (age < 5.53699) {
    return 'Waxing Crescent';
  }

  if (age < 9.22831) {
    return 'First Quarter';
  }

  if (age < 12.91963) {
    return 'Waxing Gibbous';
  }

  if (age < 16.61096) {
    return 'Full Moon';
  }

  if (age < 20.30228) {
    return 'Waning Gibbous';
  }

  if (age < 23.99361) {
    return 'Last Quarter';
  }

  if (age < 27.68493) {
    return 'Waning Crescent';
  }

  return 'New Moon';
}

function isJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') || contentType.includes('+json');
}

async function fetchJsonWithFallback(primaryUrl, fallbackUrl, signal, fallbackErrorMessage) {
  try {
    const primaryResponse = await fetch(primaryUrl, { signal });

    if (primaryResponse.ok && isJsonResponse(primaryResponse)) {
      return primaryResponse.json();
    }

    if (primaryResponse.ok) {
      const bodyPreview = (await primaryResponse.text()).trimStart();

      if (!bodyPreview.startsWith('<')) {
        throw new Error(fallbackErrorMessage);
      }
    }
  } catch {
    // Fall through to the direct upstream request.
  }

  const fallbackResponse = await fetch(fallbackUrl, { signal });

  if (!fallbackResponse.ok) {
    throw new Error(fallbackErrorMessage);
  }

  return fallbackResponse.json();
}

function buildAirQualityPayload(airQualityData) {
  const airQuality = airQualityData.current || {};
  const aqiDetails = getAqiDetails(airQuality.us_aqi ?? airQuality.european_aqi);

  return {
    airQuality: {
      value: aqiDetails.value,
      level: aqiDetails.level,
      message: aqiDetails.message,
    },
  };
}

async function fetchAirQualityForLocation(location, signal) {
  const airQualityData = await fetchJsonWithFallback(
    `/api/air-quality?latitude=${location.latitude}&longitude=${location.longitude}`,
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=us_aqi,european_aqi&timezone=auto`,
    signal,
    'Air quality service unavailable right now.'
  );

  return buildAirQualityPayload(airQualityData);
}

async function buildWeatherPayload(location, weatherData, fallbackLabel = 'Current location') {
  const current = weatherData.current;
  const daily = weatherData.daily;
  const hourly = weatherData.hourly;
  const currentWeather = getWeatherDetails(current.weather_code, Boolean(current.is_day));
  const currentHourIndex = hourly.time.findIndex((timeValue) => timeValue === current.time);
  const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
  const hourlyWindow = hourly.time.slice(startIndex, startIndex + 24);

  const alerts = [];

  if (current.relative_humidity_2m >= 85 && /Rain|Showers|Thunderstorm/.test(currentWeather.label)) {
    alerts.push('Rain and high humidity may reduce visibility.');
  }

  if (current.wind_speed_10m >= 35) {
    alerts.push('Strong winds may affect outdoor plans.');
  }

  if ((daily.uv_index_max?.[0] || 0) >= 7) {
    alerts.push('UV levels are high. Use sunscreen and stay hydrated.');
  }

  if (alerts.length === 0) {
    alerts.push('No weather alerts reported for this location right now.');
  }

  return {
    locationLabel: formatLocationLabel(location) || fallbackLabel,
    condition: currentWeather.label,
    conditionGroup: getConditionGroup(current.weather_code),
    summary: `${currentWeather.description} in ${location.name || fallbackLabel}.`,
    temperatureC: Math.round(current.temperature_2m),
    feelsLikeC: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windKph: Math.round(current.wind_speed_10m),
    pressureMb: Math.round(current.surface_pressure),
    visibilityKm: Math.round((current.visibility ?? 0) / 1000),
    dewPointC: Math.round(current.dew_point_2m),
    uvIndex: Math.round(daily.uv_index_max?.[0] ?? 0),
    sunrise: formatTime(daily.sunrise?.[0]),
    sunset: formatTime(daily.sunset?.[0]),
    moonPhase: getMoonPhaseLabel(daily.time?.[0] || current.time),
    updatedAt: formatTime(current.time),
    hourly: hourlyWindow.map((timeValue, index) => {
      const codeIndex = startIndex + index;
      const hourlyWeather = getWeatherDetails(hourly.weather_code?.[codeIndex], true);

      return {
        time: index === 0 ? 'Now' : formatTime(timeValue),
        temp: Math.round(hourly.temperature_2m?.[codeIndex]),
        icon: hourlyWeather.icon,
        rainChance: Math.round(hourly.precipitation_probability?.[codeIndex] ?? 0),
      };
    }),
    forecast: daily.time.map((dateValue, index) => {
      const dayWeather = getWeatherDetails(daily.weather_code?.[index], true);

      return {
        day: formatDayLabel(dateValue, index),
        high: Math.round(daily.temperature_2m_max?.[index]),
        low: Math.round(daily.temperature_2m_min?.[index]),
        label: dayWeather.label,
        rainChance: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
      };
    }),
    alerts,
  };
}

async function fetchWeatherForLocation(location, signal, fallbackLabel = 'Current location') {
  const weatherData = await fetchJsonWithFallback(
    `/api/weather?latitude=${location.latitude}&longitude=${location.longitude}`,
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure,weather_code,is_day,visibility,dew_point_2m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&forecast_days=7&timezone=auto`,
    signal,
    'Weather service unavailable right now.'
  );

  const airQualityData = await fetchAirQualityForLocation(location, signal).catch(() => ({
    airQuality: {
      value: null,
      level: 'Unavailable',
      message: 'Air quality data is not available right now.',
    },
  }));

  return {
    ...(await buildWeatherPayload(location, weatherData, fallbackLabel)),
    ...airQualityData,
  };
}

async function resolveLocationByName(searchTerm, signal) {
  const geocodeData = await fetchJsonWithFallback(
    `/api/geocode/search?name=${encodeURIComponent(searchTerm)}`,
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=en&format=json`,
    signal,
    'No results found. Try another location.'
  );
  const location = geocodeData.results?.[0];

  if (!location) {
    throw new Error('No results found. Try another location.');
  }

  return location;
}

async function resolveLocationByCoordinates(latitude, longitude, signal) {
  const reverseData = await fetchJsonWithFallback(
    `/api/geocode/reverse?latitude=${latitude}&longitude=${longitude}`,
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`,
    signal,
    'Unable to detect your location.'
  );
  return reverseData.results?.[0] || null;
}

export async function fetchWeatherForCity(searchTerm, signal) {
  const location = await resolveLocationByName(searchTerm, signal);

  const weatherData = await fetchJsonWithFallback(
    `/api/weather?latitude=${location.latitude}&longitude=${location.longitude}`,
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure,weather_code,is_day,visibility,dew_point_2m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&forecast_days=7&timezone=auto`,
    signal,
    'Weather service unavailable right now.'
  );

  const airQualityData = await fetchAirQualityForLocation(location, signal).catch(() => ({
    airQuality: {
      value: null,
      level: 'Unavailable',
      message: 'Air quality data is not available right now.',
    },
  }));

  return {
    ...(await buildWeatherPayload(location, weatherData)),
    ...airQualityData,
  };
}

export async function fetchWeatherForCoordinates(latitude, longitude, signal) {
  const location = (await resolveLocationByCoordinates(latitude, longitude, signal)) || {
    name: 'Current location',
    latitude,
    longitude,
  };

  return fetchWeatherForLocation(location, signal, 'Current location');
}
