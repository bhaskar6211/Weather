import React from 'react';

function AppHeader({
  searchInput,
  setSearchInput,
  handleSearchSubmit,
  statusMessage,
  greeting,
  weatherInsight,
  isLocatingLocation,
  presetCities,
  query,
  recentSearches,
  onPresetSelect,
  onRecentSelect,
  onUseCurrentLocation,
  onRefresh,
  onViewDetails,
  onAddCity,
  onRemoveLocation,
  canRemoveLocation,
}) {
  return (
    <header className="hero-panel" aria-label="App header">
      <div className="hero-copy">
        <p className="eyebrow">{greeting}</p>
        <h1>Real-Time Weather Updates</h1>
        <p className="hero-text">{weatherInsight}</p>
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
          </div>
          <div className="action-strip" aria-label="Weather actions">
            <button type="button" className="action-button action-button-primary" onClick={onRefresh}>
              Refresh
            </button>
            <button type="button" className="action-button" onClick={onViewDetails}>
              View Details
            </button>
            <button type="button" className="action-button" onClick={onAddCity}>
              Add City
            </button>
            <button type="button" className="action-button" onClick={onRemoveLocation} disabled={!canRemoveLocation}>
              Remove Location
            </button>
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
                <div className="empty-state-card recent-search-empty" aria-live="polite">
                  <strong>No recent locations yet.</strong>
                  <span>Search a city to save it here for quick access.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
