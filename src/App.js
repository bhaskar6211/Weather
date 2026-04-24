import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppHeader from './components/AppHeader';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastPanel from './components/ForecastPanel';
import SidebarPanels from './components/SidebarPanels';
import { fetchWeatherForCity, fetchWeatherForCoordinates, presetCities, toFahrenheit, toMph } from './services/weatherService';

const RECENT_SEARCHES_STORAGE_KEY = 'weather.recentSearches';
const THEME_STORAGE_KEY = 'weather.darkModeEnabled';
const MAX_RECENT_SEARCHES = 5;
const LOADING_MESSAGE = 'Fetching latest weather data...';
const ERROR_MESSAGE = 'Unable to load data. Please try again. Check your internet connection.';

function App() {
  const [locationRequest, setLocationRequest] = useState({ type: 'search', value: 'London' });
  const [searchInput, setSearchInput] = useState('London');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);
  const [windSpeedUnit, setWindSpeedUnit] = useState('km/h');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      return savedTheme === null ? true : savedTheme === 'true';
    } catch {
      return true;
    }
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLocatingLocation, setIsLocatingLocation] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const dashboardRef = useRef(null);

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

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, String(darkModeEnabled));
    } catch {
      // Ignore storage failures and keep the current theme in memory.
    }

    document.body.classList.toggle('theme-light', !darkModeEnabled);
    document.body.classList.toggle('theme-dark', darkModeEnabled);
    document.body.style.colorScheme = darkModeEnabled ? 'dark' : 'light';
  }, [darkModeEnabled]);

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

  const removeRecentSearch = (locationLabel) => {
    const trimmedLabel = locationLabel.trim();

    if (!trimmedLabel) {
      return;
    }

    setRecentSearches((currentSearches) =>
      currentSearches.filter((entry) => entry.toLowerCase() !== trimmedLabel.toLowerCase())
    );
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
            ? ERROR_MESSAGE
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
  }, [locationRequest, refreshTick]);

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

  const displayedWindSpeed = useMemo(() => {
    if (!weather) {
      return '--';
    }

    return windSpeedUnit === 'km/h' ? `${weather.windKph} km/h` : `${toMph(weather.windKph)} mph`;
  }, [weather, windSpeedUnit]);

  const greeting = useMemo(() => {
    const currentHour = new Date().getHours();

    return currentHour < 18 ? 'Good Morning ☀️' : 'Good Evening 🌙';
  }, []);

  const weatherInsight = useMemo(() => {
    if (!weather) {
      return 'Weather conditions are ideal for travel.';
    }

    if (weather.airQuality?.level === 'Unhealthy') {
      return 'Air quality is poor, consider staying indoors.';
    }

    const hasRainSignals = Boolean(
      weather.alerts?.some((alert) => /rain|umbrella|showers|humidity/i.test(alert)) ||
        /Rainy|Thunderstorm/i.test(weather.conditionGroup)
    );

    if (hasRainSignals) {
      return 'Carry an umbrella just in case.';
    }

    if (weather.temperatureC >= 28) {
      return 'Feels warmer than usual today.';
    }

    if (weather.conditionGroup === 'Clear' && weather.temperatureC >= 18) {
      return 'Perfect weather for outdoor activities.';
    }

    return 'Weather conditions are ideal for travel.';
  }, [weather]);

  const professionalNotes = useMemo(() => {
    const notes = [];

    if (weather?.temperatureC >= 28) {
      notes.push('Feels warmer than usual today.');
    }

    if (weather?.conditionGroup === 'Clear' && weather?.temperatureC >= 18) {
      notes.push('Perfect weather for outdoor activities.');
    }

    if (
      weather?.airQuality?.level === 'Unhealthy' ||
      weather?.alerts?.some((alert) => /rain|showers|humidity|wind/i.test(alert))
    ) {
      notes.push('Carry an umbrella just in case.');
    }

    if (notes.length === 0) {
      notes.push('Perfect weather for outdoor activities.');
    }

    return notes.slice(0, 3);
  }, [weather]);

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

  const handleRefresh = () => {
    setRefreshTick((value) => value + 1);
  };

  const handleViewDetails = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddCity = () => {
    addRecentSearch(weather?.locationLabel || searchInput);
  };

  const handleRemoveLocation = () => {
    removeRecentSearch(weather?.locationLabel || searchInput);
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
      ? LOADING_MESSAGE
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
        greeting={greeting}
        weatherInsight={weatherInsight}
        isLocatingLocation={isLocatingLocation}
        presetCities={presetCities}
        query={activeSearchValue}
        recentSearches={recentSearches}
        onPresetSelect={handlePresetSelect}
        onRecentSelect={handleRecentSelect}
        onUseCurrentLocation={handleCurrentLocation}
        onRefresh={handleRefresh}
        onViewDetails={handleViewDetails}
        onAddCity={handleAddCity}
        onRemoveLocation={handleRemoveLocation}
        canRemoveLocation={Boolean(searchInput.trim() || weather?.locationLabel)}
      />

      <section className="dashboard-grid" ref={dashboardRef}>
        <CurrentWeatherCard
          weather={weather}
          query={displayQuery}
          isLoading={isLoading}
          error={error}
          isCelsius={isCelsius}
          windSpeedUnit={windSpeedUnit}
          loadingMessage={LOADING_MESSAGE}
          onToggleUnits={() => setIsCelsius((value) => !value)}
          displayedTemperature={displayedTemperature}
          displayedFeelsLike={displayedFeelsLike}
          displayedWindSpeed={displayedWindSpeed}
        />

        <SidebarPanels
          weather={weather}
          isLoading={isLoading}
          isCelsius={isCelsius}
          windSpeedUnit={windSpeedUnit}
          notificationsEnabled={notificationsEnabled}
          darkModeEnabled={darkModeEnabled}
          toFahrenheit={toFahrenheit}
          toMph={toMph}
          loadingMessage={LOADING_MESSAGE}
          smartSuggestion={weatherInsight}
          professionalNotes={professionalNotes}
          onToggleTemperatureUnit={() => setIsCelsius((value) => !value)}
          onToggleWindSpeedUnit={() => setWindSpeedUnit((value) => (value === 'km/h' ? 'mph' : 'km/h'))}
          onToggleNotifications={() => setNotificationsEnabled((value) => !value)}
          onToggleDarkMode={() => setDarkModeEnabled((value) => !value)}
        />
      </section>

      <ForecastPanel
        weather={weather}
        isLoading={isLoading}
        isCelsius={isCelsius}
        loadingMessage={LOADING_MESSAGE}
        toFahrenheit={toFahrenheit}
      />
    </main>
  );
}

export default App;
