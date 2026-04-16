import React, { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastPanel from './components/ForecastPanel';
import SidebarPanels from './components/SidebarPanels';
import { fetchWeatherForCity, fetchWeatherForCoordinates, presetCities, toFahrenheit } from './services/weatherService';

const RECENT_SEARCHES_STORAGE_KEY = 'weather.recentSearches';
const MAX_RECENT_SEARCHES = 5;

function App() {
  const [locationRequest, setLocationRequest] = useState({ type: 'search', value: 'London' });
  const [searchInput, setSearchInput] = useState('London');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLocatingLocation, setIsLocatingLocation] = useState(false);

  useEffect(() => {
    try {
      const savedSearches = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) || '[]');

      if (Array.isArray(savedSearches)) {
        setRecentSearches(
          savedSearches.filter((entry) => typeof entry === 'string' && entry.trim()).slice(0, MAX_RECENT_SEARCHES)
        );
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addRecentSearch = (locationLabel) => {
    const trimmedLabel = locationLabel.trim();

    if (!trimmedLabel) {
      return;
    }

    setRecentSearches((currentSearches) => [
      trimmedLabel,
      ...currentSearches.filter((entry) => entry.toLowerCase() !== trimmedLabel.toLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES));
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      setIsLoading(true);
      setError('');

      try {
        const result =
          locationRequest.type === 'coords'
            ? await fetchWeatherForCoordinates(locationRequest.latitude, locationRequest.longitude, controller.signal)
            : await fetchWeatherForCity(locationRequest.value, controller.signal);

        setWeather(result);
        setSearchInput(result.locationLabel || locationRequest.value);
        addRecentSearch(result.locationLabel || locationRequest.value);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setWeather(null);
        setError(
          fetchError?.message === 'Failed to fetch'
            ? 'Unable to reach the weather service. Run the app with npm run server from the weather folder.'
            : fetchError.message || 'Failed to load weather data.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [locationRequest]);

  const displayedTemperature = useMemo(() => {
    if (!weather) {
      return '--';
    }

    return isCelsius ? `${weather.temperatureC}°C` : `${toFahrenheit(weather.temperatureC)}°F`;
  }, [isCelsius, weather]);

  const displayedFeelsLike = useMemo(() => {
    if (!weather) {
      return '--';
    }

    return isCelsius ? `${weather.feelsLikeC}°C` : `${toFahrenheit(weather.feelsLikeC)}°F`;
  }, [isCelsius, weather]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedValue = searchInput.trim();

    if (!trimmedValue) {
      return;
    }

    setLocationRequest({ type: 'search', value: trimmedValue });
  };

  const handlePresetSelect = (cityName) => {
    setSearchInput(cityName);
    setLocationRequest({ type: 'search', value: cityName });
  };

  const handleRecentSelect = (locationLabel) => {
    setSearchInput(locationLabel);
    setLocationRequest({ type: 'search', value: locationLabel });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location access is not supported in this browser.');
      return;
    }

    setIsLocatingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationRequest({
          type: 'coords',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocatingLocation(false);
      },
      () => {
        setIsLocatingLocation(false);
        setError('Unable to detect your location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const statusMessage = isLocatingLocation
    ? 'Detecting your location...'
    : isLoading
      ? 'Loading live weather...'
      : error
        ? error
        : 'Live data from Open-Meteo';

  const activeSearchValue = locationRequest.type === 'search' ? locationRequest.value : '';
  const displayQuery = weather?.locationLabel || activeSearchValue || 'Current location';

  return (
    <main className="app-shell">
      <AppHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearchSubmit={handleSearchSubmit}
        statusMessage={statusMessage}
        isLocatingLocation={isLocatingLocation}
        presetCities={presetCities}
        query={activeSearchValue}
        recentSearches={recentSearches}
        onPresetSelect={handlePresetSelect}
        onRecentSelect={handleRecentSelect}
        onUseCurrentLocation={handleCurrentLocation}
      />

      <section className="dashboard-grid">
        <CurrentWeatherCard
          weather={weather}
          query={displayQuery}
          isLoading={isLoading}
          error={error}
          isCelsius={isCelsius}
          onToggleUnits={() => setIsCelsius((value) => !value)}
          displayedTemperature={displayedTemperature}
          displayedFeelsLike={displayedFeelsLike}
        />

        <SidebarPanels
          weather={weather}
          isLoading={isLoading}
          isCelsius={isCelsius}
          toFahrenheit={toFahrenheit}
        />
      </section>

      <ForecastPanel
        weather={weather}
        isLoading={isLoading}
        isCelsius={isCelsius}
        toFahrenheit={toFahrenheit}
      />
    </main>
  );
}

export default App;
