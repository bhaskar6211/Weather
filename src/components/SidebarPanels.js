import React from 'react';

function SidebarPanels({
  weather,
  isLoading,
  isCelsius,
  windSpeedUnit,
  notificationsEnabled,
  darkModeEnabled,
  toFahrenheit,
  toMph,
  onToggleTemperatureUnit,
  onToggleWindSpeedUnit,
  onToggleNotifications,
  onToggleDarkMode,
}) {
  const airQuality = weather?.airQuality;
  const sunriseLabel = weather?.sunrise || '--';
  const sunsetLabel = weather?.sunset || '--';
  const moonPhaseLabel = weather?.moonPhase || '--';
  const hasAlerts = Boolean(weather?.alerts?.length);
  const alertHeadline = hasAlerts ? 'Severe weather warning in your area' : 'No active alerts';
  const alertBody = hasAlerts ? 'Heavy rainfall expected. Stay safe.' : 'No active alerts right now.';

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

      <section className="panel panel-soft info-panel">
        <div className="panel-header">
          <h3>Air Quality</h3>
          <span>Current index</span>
        </div>
        <div className="info-block">
          <div className="aqi-pill-row">
            <strong className="aqi-value">AQI: {airQuality?.value ?? '--'} ({airQuality?.level || 'Unavailable'})</strong>
            <span className={`aqi-level ${airQuality?.level ? `aqi-level-${airQuality.level.toLowerCase().replace(/\s+/g, '-')}` : ''}`}>
              {airQuality?.level || 'Unavailable'}
            </span>
          </div>
          <p className="info-copy">Health Recommendation: {airQuality?.message || 'Air quality data is not available right now.'}</p>
        </div>
      </section>

      <section className="panel panel-soft info-panel">
        <div className="panel-header">
          <h3>Sun & Moon</h3>
          <span>Today</span>
        </div>
        <div className="info-list">
          <div className="info-row">
            <span>Sunrise</span>
            <strong>{sunriseLabel}</strong>
          </div>
          <div className="info-row">
            <span>Sunset</span>
            <strong>{sunsetLabel}</strong>
          </div>
          <div className="info-row">
            <span>Moon Phase</span>
            <strong>{moonPhaseLabel}</strong>
          </div>
        </div>
      </section>

      <section className="panel alert-panel panel-soft">
        <div className="panel-header">
          <h3>Weather Alerts</h3>
          <span>Live advisory</span>
        </div>
        <div className={`alert-banner ${hasAlerts ? 'alert-banner-active' : 'alert-banner-clear'}`}>
          <span className="alert-badge">{hasAlerts ? 'Advisory' : 'All clear'}</span>
          <h4>{alertHeadline}</h4>
          <p>{isLoading ? 'Checking active alerts...' : alertBody}</p>
        </div>
        {hasAlerts ? (
          <ul className="alert-list">
            {weather.alerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="panel settings-panel panel-soft">
        <div className="panel-header">
          <h3>Settings</h3>
          <span>Display preferences</span>
        </div>

        <div className="settings-list">
          <div className="setting-row">
            <div>
              <span className="setting-label">Temperature Unit</span>
              <p className="setting-copy">{isCelsius ? '°C' : '°F'}</p>
            </div>
            <button type="button" className="setting-toggle" onClick={onToggleTemperatureUnit}>
              {isCelsius ? '°C' : '°F'}
            </button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-label">Wind Speed Unit</span>
              <p className="setting-copy">{windSpeedUnit}</p>
            </div>
            <button type="button" className="setting-toggle" onClick={onToggleWindSpeedUnit}>
              {windSpeedUnit}
            </button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-label">Enable Notifications</span>
              <p className="setting-copy">{notificationsEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <button
              type="button"
              className={`setting-switch ${notificationsEnabled ? 'setting-switch-on' : ''}`}
              onClick={onToggleNotifications}
              aria-pressed={notificationsEnabled}
            >
              <span />
            </button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-label">Dark Mode</span>
              <p className="setting-copy">{darkModeEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <button
              type="button"
              className={`setting-switch ${darkModeEnabled ? 'setting-switch-on' : ''}`}
              onClick={onToggleDarkMode}
              aria-pressed={darkModeEnabled}
            >
              <span />
            </button>
          </div>
        </div>

        <div className="settings-footnote">
          <span>Default wind display: {weather ? `${weather.windKph} km/h` : '--'}</span>
          <span>Converted: {weather ? `${toMph(weather.windKph)} mph` : '--'}</span>
        </div>
      </section>
    </aside>
  );
}

export default SidebarPanels;
