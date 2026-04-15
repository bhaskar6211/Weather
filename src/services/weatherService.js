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

export async function fetchWeatherForCity(searchTerm, signal) {
  const geocodeResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=en&format=json`,
    { signal }
  );

  if (!geocodeResponse.ok) {
    throw new Error('Could not look up that location.');
  }

  const geocodeData = await geocodeResponse.json();
  const location = geocodeData.results?.[0];

  if (!location) {
    throw new Error(`No location found for "${searchTerm}".`);
  }

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure,weather_code,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&forecast_days=7&timezone=auto`,
    { signal }
  );

  if (!weatherResponse.ok) {
    throw new Error('Weather service unavailable right now.');
  }

  const weatherData = await weatherResponse.json();
  const current = weatherData.current;
  const daily = weatherData.daily;
  const hourly = weatherData.hourly;
  const currentWeather = getWeatherDetails(current.weather_code, Boolean(current.is_day));
  const currentHourIndex = hourly.time.findIndex((timeValue) => timeValue === current.time);
  const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
  const hourlyWindow = hourly.time.slice(startIndex, startIndex + 6);

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
    locationLabel: formatLocationLabel(location),
    condition: currentWeather.label,
    summary: `${currentWeather.description} in ${location.name}.`,
    temperatureC: Math.round(current.temperature_2m),
    feelsLikeC: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windKph: Math.round(current.wind_speed_10m),
    pressureMb: Math.round(current.surface_pressure),
    uvIndex: Math.round(daily.uv_index_max?.[0] ?? 0),
    sunrise: formatTime(daily.sunrise?.[0]),
    sunset: formatTime(daily.sunset?.[0]),
    hourly: hourlyWindow.map((timeValue, index) => {
      const codeIndex = startIndex + index;
      const hourlyWeather = getWeatherDetails(hourly.weather_code?.[codeIndex], true);

      return {
        time: index === 0 ? 'Now' : formatTime(timeValue),
        temp: Math.round(hourly.temperature_2m?.[codeIndex]),
        icon: hourlyWeather.icon,
      };
    }),
    forecast: daily.time.map((dateValue, index) => {
      const dayWeather = getWeatherDetails(daily.weather_code?.[index], true);

      return {
        day: formatDayLabel(dateValue, index),
        high: Math.round(daily.temperature_2m_max?.[index]),
        low: Math.round(daily.temperature_2m_min?.[index]),
        label: dayWeather.label,
      };
    }),
    alerts,
  };
}
