import React from 'react';
import WeatherMetric from './WeatherMetric';

function CurrentWeatherCard({
  weather,
  query,
  isLoading,
  error,
  isCelsius,
  onToggleUnits,
  displayedTemperature,
  displayedFeelsLike,
}) {
  return (
    <article className="current-card">
      <div className="current-topline">
        <div>
          <p className="location">{weather ? weather.locationLabel : query}</p>
          <h2>{isLoading ? 'Loading current conditions' : error ? 'Weather unavailable' : weather.condition}</h2>
          <p className="summary">
            {isLoading ? 'Fetching the latest forecast data right now.' : error || weather.summary}
          </p>
        </div>
        <button type="button" className="unit-toggle" onClick={onToggleUnits} disabled={!weather}>
          Switch to {isCelsius ? 'Fahrenheit' : 'Celsius'}
        </button>
      </div>

      <div className="temperature-row">
        <span className="temperature">{displayedTemperature}</span>
        <div className="temperature-meta">
          <span>Feels like {displayedFeelsLike}</span>
          <span>{isLoading ? 'Updating now' : 'Updated a few moments ago'}</span>
        </div>
      </div>

      <div className="stats-grid">
        <WeatherMetric label="Humidity" value={weather ? `${weather.humidity}%` : '--'} detail="Comfort index" />
        <WeatherMetric label="Wind" value={weather ? `${weather.windKph} kph` : '--'} detail="Steady breeze" />
        <WeatherMetric label="Pressure" value={weather ? `${weather.pressureMb} mb` : '--'} detail="Sea-level reading" />
        <WeatherMetric label="UV Index" value={weather ? weather.uvIndex : '--'} detail="Sun exposure" />
        <WeatherMetric label="Sunrise" value={weather ? weather.sunrise : '--:--'} detail="Morning light" />
        <WeatherMetric label="Sunset" value={weather ? weather.sunset : '--:--'} detail="Golden hour" />
      </div>
    </article>
  );
}

export default CurrentWeatherCard;
