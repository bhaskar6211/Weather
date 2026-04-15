import React, { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastPanel from './components/ForecastPanel';
import SidebarPanels from './components/SidebarPanels';
import { fetchWeatherForCity, presetCities, toFahrenheit } from './services/weatherService';

function App() {
  const [query, setQuery] = useState('London');
  const [searchInput, setSearchInput] = useState('London');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      setIsLoading(true);
      setError('');

      try {
        const result = await fetchWeatherForCity(query, controller.signal);
        setWeather(result);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setWeather(null);
        setError(fetchError.message || 'Failed to load weather data.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [query]);

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

    setQuery(trimmedValue);
  };

  return (
    <main className="app-shell">
      <AppHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearchSubmit={handleSearchSubmit}
        isLoading={isLoading}
        error={error}
        presetCities={presetCities}
        query={query}
        onPresetSelect={(cityName) => {
          setSearchInput(cityName);
          setQuery(cityName);
        }}
      />

      <section className="dashboard-grid">
        <CurrentWeatherCard
          weather={weather}
          query={query}
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
