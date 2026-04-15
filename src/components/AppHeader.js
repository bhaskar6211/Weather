import React from 'react';

function AppHeader({
  searchInput,
  setSearchInput,
  handleSearchSubmit,
  isLoading,
  error,
  presetCities,
  query,
  onPresetSelect,
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
            placeholder="Search a city"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Search for a city"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="status-row">
          <span className="status-pill">
            {isLoading ? 'Loading live weather...' : error ? 'Update failed' : 'Live data from Open-Meteo'}
          </span>
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
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
