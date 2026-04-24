import React from 'react';

function ForecastPanel({ weather, isLoading, isCelsius, loadingMessage, toFahrenheit }) {
  return (
    <section className="forecast-panel panel panel-soft">
      <div className="panel-header">
        <h3>7-Day Forecast</h3>
        <span>Weekly outlook</span>
      </div>
      <div className="forecast-list">
        {weather?.forecast?.length ? (
          weather.forecast.map((day) => (
            <div key={day.day} className="forecast-row">
              <div className="forecast-dayblock">
                <span className="forecast-day">{day.day}</span>
                <span className="forecast-label">{day.label}</span>
                <span className="forecast-rain">Chance of Rain: {day.rainChance}%</span>
              </div>
              <div className="forecast-rangeblock">
                <span className="forecast-range-label">High</span>
                <span className="forecast-range-value">
                  {isCelsius ? `${day.high}°` : `${toFahrenheit(day.high)}°`}
                </span>
                <span className="forecast-range-label">Low</span>
                <span className="forecast-range-value forecast-range-value-muted">
                  {isCelsius ? `${day.low}°` : `${toFahrenheit(day.low)}°`}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">{isLoading ? loadingMessage : 'Forecast data is not available.'}</p>
        )}
      </div>
    </section>
  );
}

export default ForecastPanel;
