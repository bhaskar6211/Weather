import React from 'react';
import WeatherMetric from './WeatherMetric';

function CurrentWeatherCard({
  weather,
  query,
  isLoading,
  error,
  isCelsius,
  windSpeedUnit,
  onToggleUnits,
  displayedTemperature,
  displayedFeelsLike,
  displayedWindSpeed,
}) {
  const conditionLabel = weather?.conditionGroup || weather?.condition || '--';
  const updatedAtLabel = weather?.updatedAt || '--';

  return (
    <article className="current-card">
      <div className="current-topline">
        <div>
          <p className="location">{weather ? weather.locationLabel : query}</p>
          <h2>Now</h2>
          <p className="summary">{isLoading ? 'Fetching the latest forecast data right now.' : error || weather?.summary}</p>
        </div>
        <button type="button" className="unit-toggle" onClick={onToggleUnits} disabled={!weather}>
          Switch to {isCelsius ? 'Fahrenheit' : 'Celsius'}
        </button>
      </div>

      <div className="temperature-row">
        <span className="temperature">{displayedTemperature}</span>
        <div className="temperature-meta">
          <span>Feels like {displayedFeelsLike}</span>
          <span>{isLoading ? 'Last updated at --' : `Last updated at ${updatedAtLabel}`}</span>
        </div>
      </div>

      <p className="condition-line">Condition: {conditionLabel}</p>

      <div className="stats-grid">
        <WeatherMetric label="Humidity" value={weather ? `${weather.humidity}%` : '--'} detail="Moisture in the air" />
        <WeatherMetric label="Wind Speed" value={displayedWindSpeed} detail={`Surface wind in ${windSpeedUnit}`} />
        <WeatherMetric label="Pressure" value={weather ? `${weather.pressureMb} hPa` : '--'} detail="Air pressure" />
        <WeatherMetric label="Visibility" value={weather ? `${weather.visibilityKm} km` : '--'} detail="Clear view range" />
        <WeatherMetric label="UV Index" value={weather ? weather.uvIndex : '--'} detail="Sun exposure" />
        <WeatherMetric label="Dew Point" value={weather ? `${weather.dewPointC}°` : '--'} detail="Humidity threshold" />
      </div>
    </article>
  );
}

export default CurrentWeatherCard;
