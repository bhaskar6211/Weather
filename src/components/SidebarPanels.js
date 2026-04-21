import React from 'react';

function SidebarPanels({ weather, isLoading, isCelsius, toFahrenheit }) {
  return (
    <aside className="sidebar-stack">
      <section className="panel panel-soft">
        <div className="panel-header">
          <h3>Hourly Forecast</h3>
          <span>Next 24 Hours</span>
        </div>
        <div className="hourly-list">
          {weather?.hourly?.length ? (
            weather.hourly.map((item) => (
              <div key={item.time} className="hourly-item">
                <div className="hourly-timeblock">
                  <span className="hourly-time">{item.time}</span>
                  <span className="hourly-rain">Chance of Rain: {item.rainChance}%</span>
                </div>
                <strong className="hourly-icon">{item.icon}</strong>
                <span className="hourly-temp">{isCelsius ? `${item.temp}°C` : `${toFahrenheit(item.temp)}°F`}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">{isLoading ? 'Loading hourly data...' : 'Hourly data is not available.'}</p>
          )}
        </div>
      </section>

      <section className="panel alert-panel panel-soft">
        <div className="panel-header">
          <h3>Weather Alerts</h3>
          <span>Live advisory</span>
        </div>
        {weather?.alerts?.length ? (
          <ul>
            {weather.alerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{isLoading ? 'Checking active alerts...' : 'No active alerts right now.'}</p>
        )}
      </section>
    </aside>
  );
}

export default SidebarPanels;
