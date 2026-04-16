import React from 'react';

function AppHeader({
  searchInput,
  setSearchInput,
  handleSearchSubmit,
  statusMessage,
  isLocatingLocation,
  presetCities,
  query,
  recentSearches,
  onPresetSelect,
  onRecentSelect,
  onUseCurrentLocation,
}) {
  return (
    <header className="hero-panel" aria-label="App header">
      <div className="hero-copy">
        <p className="eyebrow">Weather Forecast</p>
        <h1>Real-Time Weather Updates</h1>
        <p className="hero-text">Stay Ahead of the Weather</p>
        <p className="hero-description">
          Track current conditions, hourly shifts, and the weekly outlook in one clean view built for fast
          decisions.
        </p>
      </div>

      <div className="hero-actions">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            className="search-input"
            type="search"
            placeholder="Search city, state, or country"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Search city, state, or country"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="status-row">
          <div className="search-meta-row">
            <button type="button" className="location-button" onClick={onUseCurrentLocation}>
              {isLocatingLocation ? 'Detecting your location...' : 'Current Location'}
            </button>
            <span className="status-pill">{statusMessage}</span>
          </div>
          <div className="city-switcher" aria-label="Quick city presets">
            {presetCities.map((cityName) => (
              <button
                key={cityName}
                type="button"
                className={cityName.toLowerCase() === query.toLowerCase() ? 'city-button active' : 'city-button'}
                onClick={() => onPresetSelect(cityName)}
              >
                {cityName}
              </button>
            ))}
          </div>
          <div className="recent-searches" aria-label="Recently searched locations">
            <p className="recent-searches-label">Recently searched locations</p>
            <div className="recent-search-list">
              {recentSearches.length ? (
                recentSearches.map((locationLabel) => (
                  <button
                    key={locationLabel}
                    type="button"
                    className={locationLabel.toLowerCase() === query.toLowerCase() ? 'city-button active' : 'city-button'}
                    onClick={() => onRecentSelect(locationLabel)}
                  >
                    {locationLabel}
                  </button>
                ))
              ) : (
                <span className="recent-search-empty">No recent locations yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
