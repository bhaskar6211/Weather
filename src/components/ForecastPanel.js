import React from 'react';

function ForecastPanel({ weather, isLoading, isCelsius, toFahrenheit }) {
  return (
    <section className="forecast-panel panel panel-soft">
      <div className="panel-header">
        <h3>7-Day Outlook</h3>
        <span>Forecast overview</span>
      </div>
      <div className="forecast-list">
        {weather?.forecast?.length ? (
          weather.forecast.map((day) => (
            <div key={day.day} className="forecast-row">
              <span className="forecast-day">{day.day}</span>
              <span className="forecast-label">{day.label}</span>
              <span className="forecast-range">
                {isCelsius
                  ? `${day.high}° / ${day.low}°`
                  : `${toFahrenheit(day.high)}° / ${toFahrenheit(day.low)}°`}
              </span>
            </div>
          ))
        ) : (
          <p className="empty-state">{isLoading ? 'Loading forecast...' : 'Forecast data is not available.'}</p>
        )}
      </div>
    </section>
  );
}

export default ForecastPanel;
