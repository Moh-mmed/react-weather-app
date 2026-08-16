import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import WeatherContext from "../contexts/WeatherContext";
import Dashboard from "./Dashboard";
import Spinner from "./Spinner";
import Error from "./Error";
import { OPEN_WEATHER_API_KEY } from "../helpers/openWeather";
import { buildOpenWeatherPayload } from "../helpers/openWeatherAdapter";
import { fetchAstronomyData } from "../services/astronomyService";
import { useTimeFormat } from "../contexts/TimeFormatContext";

// ─── Location persistence ──────────────────────────────────────────────────
const LOCATION_KEY = "weatherme:lastLocation";
const WEATHER_CACHE_MAP_KEY = "weatherme:weatherCacheMap";
const STALE_AFTER_MS = 60 * 60 * 1000; // city snapshots are served from cache for up to 1 hour
const POLL_INTERVAL_MS = 60 * 60 * 1000; // pinned location refresh cadence — matches the cache window
/**
 * Persist the user's most recent location so the next visit loads instantly
 * without waiting on a geolocation permission prompt.
 */
const saveLocation = (lat, lon, city, country, state) => {
  try {
    localStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ lat, lon, city, country, state: state ?? null }),
    );
  } catch (_) {
    // localStorage unavailable (private browsing / quota exceeded) — fail silently
  }
};

const getCacheKey = (lat, lon) => {
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
};

/** Persist weather + air quality data with a timestamp for offline/error fallback. */
const saveWeatherCache = (
  lat,
  lon,
  weatherData,
  airQuality,
  astronomy,
  use12h,
) => {
  const key = getCacheKey(lat, lon);
  if (!key) return;
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_MAP_KEY);
    const cacheMap = raw ? JSON.parse(raw) : {};
    const existing = cacheMap[key] || {};
    cacheMap[key] = {
      weatherData:
        weatherData !== undefined ? weatherData : existing.weatherData,
      airQuality: airQuality !== undefined ? airQuality : existing.airQuality,
      astronomy: astronomy !== undefined ? astronomy : existing.astronomy,
      use12h: use12h !== undefined ? use12h : existing.use12h,
      savedAt: Date.now(),
    };
    localStorage.setItem(WEATHER_CACHE_MAP_KEY, JSON.stringify(cacheMap));
  } catch (_) {}
};

/** Load the cached weather snapshot. Returns null if nothing is stored. */
const loadWeatherCache = (lat, lon) => {
  const key = getCacheKey(lat, lon);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_MAP_KEY);
    if (!raw) return null;
    const cacheMap = JSON.parse(raw);
    const cached = cacheMap[key];
    if (cached?.weatherData && cached?.savedAt) {
      return cached;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * True when the cached snapshot's sunrise belongs to the same local calendar
 * day as `nowSec`. Sunrise/sunset go stale after midnight, which makes the sun
 * panel compute night against a sky that no longer matches today's.
 */
const isWeatherDayCurrent = (weatherData, nowSec) => {
  const timezone = weatherData?.timezone_offset ?? 0;
  const sunrise = weatherData?.current?.sunrise;
  if (!Number.isFinite(sunrise) || !Number.isFinite(timezone)) return false;
  const localNow = new Date((nowSec + timezone) * 1000);
  const localSunrise = new Date((sunrise + timezone) * 1000);
  return (
    localNow.getUTCFullYear() === localSunrise.getUTCFullYear() &&
    localNow.getUTCMonth() === localSunrise.getUTCMonth() &&
    localNow.getUTCDate() === localSunrise.getUTCDate()
  );
};

/**
 * Read the saved location. Returns null on any failure (missing key, corrupted
 * JSON, missing fields) so callers can fall through to geolocation safely.
 * Also migrates legacy separate `coordinates` + `currentCity` keys transparently.
 */
const loadSavedLocation = () => {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (
        p &&
        typeof p.lat === "number" &&
        typeof p.lon === "number" &&
        p.city &&
        p.country
      ) {
        // `state` is optional — older persisted records won't have it
        return {
          lat: p.lat,
          lon: p.lon,
          city: p.city,
          country: p.country,
          state: p.state ?? null,
        };
      }
    }
    // Migration: read legacy separate keys so existing users don't lose their location
    const oldCoords = JSON.parse(localStorage.getItem("coordinates"));
    const oldCity = JSON.parse(localStorage.getItem("currentCity"));
    if (
      oldCoords &&
      typeof oldCoords.lat === "number" &&
      typeof oldCoords.lon === "number" &&
      oldCity?.city &&
      oldCity?.country
    ) {
      return {
        lat: oldCoords.lat,
        lon: oldCoords.lon,
        city: oldCity.city,
        country: oldCity.country,
      };
    }
    return null;
  } catch {
    return null;
  }
};
// ──────────────────────────────────────────────────────────────────────────

const Home = () => {
  const { t } = useTranslation();
  const { hourFormat } = useTimeFormat();
  const use12h = hourFormat === "12h";
  const [searchCity, setSearchCity] = useState(null);
  const [currCity, setCurrCity] = useState(() => {
    const saved = loadSavedLocation();
    return saved ? { city: saved.city, country: saved.country } : null;
  });
  const [coords, setCoords] = useState(() => {
    const saved = loadSavedLocation();
    return saved ? { lat: saved.lat, lon: saved.lon } : null;
  });
  const [weatherData, setWeatherData] = useState(() => {
    const saved = loadSavedLocation();
    if (saved) {
      const cache = loadWeatherCache(saved.lat, saved.lon);
      return cache?.weatherData ?? null;
    }
    return null;
  });
  const [airQuality, setAirQuality] = useState(() => {
    const saved = loadSavedLocation();
    if (saved) {
      const cache = loadWeatherCache(saved.lat, saved.lon);
      return cache?.airQuality ?? null;
    }
    return null;
  });
  const [astronomy, setAstronomy] = useState(() => {
    const saved = loadSavedLocation();
    if (saved) {
      const cache = loadWeatherCache(saved.lat, saved.lon);
      return cache?.astronomy ?? null;
    }
    return null;
  });
  const [cityNotFound, setCityNotFound] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isUpdatingLocation] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => {
    const saved = loadSavedLocation();
    if (saved) {
      const cache = loadWeatherCache(saved.lat, saved.lon);
      return cache?.savedAt ?? null;
    }
    return null;
  });
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Saved locations state & data cache
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const saved = localStorage.getItem("weatherme:savedLocations");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [savedWeatherData, setSavedWeatherData] = useState(() => {
    try {
      const saved = localStorage.getItem("weatherme:savedLocations");
      const locations = saved ? JSON.parse(saved) : [];
      const initialData = {};
      locations.forEach((loc) => {
        const cache = loadWeatherCache(loc.lat, loc.lon);
        if (cache) {
          initialData[`${loc.lat},${loc.lon}`] = {
            weatherData: cache.weatherData,
            airQuality: cache.airQuality,
            astronomy: cache.astronomy ?? null,
            use12h: cache.use12h ?? null,
            fetchedAt: cache.savedAt ?? null,
          };
        }
      });
      return initialData;
    } catch (_) {
      return {};
    }
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const lastFetchedCoordsRef = useRef(null);
  const lastFetchedFormatRef = useRef(null);
  const currCityRef = useRef(currCity);

  useEffect(() => {
    currCityRef.current = currCity;
  }, [currCity]);

  const handleApiError = (err, fallbackKey) => {
    const status = err?.response?.status;
    if (status === 401) {
      setApiError("error.rejectedKey");
      return;
    }

    setApiError(fallbackKey);
  };

  // Persist saved locations list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "weatherme:savedLocations",
        JSON.stringify(savedLocations),
      );
    } catch (_) {}
  }, [savedLocations]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, savedLocations.length));
  }, [savedLocations.length]);

  const addSavedLocation = useCallback(
    (loc) => {
      const isDuplicate = savedLocations.some(
        (item) =>
          Math.abs(item.lat - loc.lat) < 0.01 &&
          Math.abs(item.lon - loc.lon) < 0.01,
      );
      if (!isDuplicate) {
        setSavedLocations((prev) => [...prev, loc]);
        setActiveIndex(0);
      }
    },
    [savedLocations],
  );

  const removeSavedLocation = useCallback((lat, lon) => {
    setSavedLocations((prev) =>
      prev.filter(
        (item) =>
          !(Math.abs(item.lat - lat) < 0.01 && Math.abs(item.lon - lon) < 0.01),
      ),
    );
    setSavedWeatherData((prev) => {
      const next = { ...prev };
      const key = Object.keys(next).find((k) => {
        const [klat, klon] = k.split(",").map(Number);
        return Math.abs(klat - lat) < 0.01 && Math.abs(klon - lon) < 0.01;
      });
      if (key) delete next[key];
      return next;
    });
  }, []);

  const fetchWeatherDataForLocation = useCallback(
    async (lat, lon, cityName) => {
      const key = `${lat},${lon}`;
      const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      const uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`;
      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`;

      try {
        const [
          currentResponse,
          forecastResponse,
          uviResponse,
          airQualityResponse,
          astroResponse,
        ] = await Promise.allSettled([
          axios.get(currentWeatherURL, {
            headers: { Accept: "application/json" },
          }),
          axios.get(forecastURL, { headers: { Accept: "application/json" } }),
          axios.get(uviURL, { headers: { Accept: "application/json" } }),
          axios.get(airQualityURL, { headers: { Accept: "application/json" } }),
          fetchAstronomyData(lat, lon, use12h, cityName),
        ]);

        if (
          currentResponse.status === "rejected" ||
          forecastResponse.status === "rejected" ||
          uviResponse.status === "rejected" ||
          airQualityResponse.status === "rejected"
        ) {
          throw new Error("One or more weather requests failed");
        }

        const astronomy =
          astroResponse.status === "fulfilled" ? astroResponse.value : null;

        const payload = buildOpenWeatherPayload(
          currentResponse.value,
          forecastResponse.value,
          uviResponse.value,
        );

        setSavedWeatherData((prev) => ({
          ...prev,
          [key]: {
            weatherData: payload,
            airQuality: airQualityResponse.value.data,
            astronomy,
            use12h,
            fetchedAt: Date.now(),
          },
        }));
        saveWeatherCache(
          lat,
          lon,
          payload,
          airQualityResponse.value.data,
          astronomy,
          use12h,
        );
      } catch (err) {
        console.error(
          `Failed to fetch weather for location ${lat}, ${lon}:`,
          err,
        );
      }
    },
    [use12h],
  );

  // Lazy per-city loading: fetch a saved city's data only when the user
  // actually swipes to it (activeIndex changes). Cached snapshots are served
  // as-is for up to 1 hour (STALE_AFTER_MS); anything older, written in a
  // different hour format, or from a previous calendar day is refetched.
  // This freshness gate is the ONLY one that matters — a failed Visual
  // Crossing call (null moonrise/moonset) is retried on the next visit or
  // after the hour, instead of being refetched in a tight loop.
  useEffect(() => {
    if (!OPEN_WEATHER_API_KEY) return;
    if (activeIndex <= 0 || activeIndex > savedLocations.length) return;

    const loc = savedLocations[activeIndex - 1];
    const key = `${loc.lat},${loc.lon}`;
    const cached = savedWeatherData[key];

    const formatMatches = cached?.use12h === use12h;
    const weatherIsCurrent =
      !!cached?.weatherData &&
      isWeatherDayCurrent(cached.weatherData, Math.floor(Date.now() / 1000));
    const isRecentlyFetched =
      !!cached?.fetchedAt && Date.now() - cached.fetchedAt < STALE_AFTER_MS;

    if (cached && isRecentlyFetched && formatMatches && weatherIsCurrent) return;

    const timer = setTimeout(
      () => fetchWeatherDataForLocation(loc.lat, loc.lon, loc.city),
      0,
    );
    return () => clearTimeout(timer);
  }, [
    activeIndex,
    savedLocations,
    savedWeatherData,
    fetchWeatherDataForLocation,
    use12h,
  ]);

  // Lifted to component level so it's callable from both the init useEffect
  // and from handleGeoCoords (triggered by the geolocation button in NavBarForm).
  // Saves weatherme:lastLocation after successful reverse geocode.
  const findCityName = useCallback(async (cor) => {
    const reverseURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${cor.lat}&lon=${cor.lon}&limit=5&appid=${OPEN_WEATHER_API_KEY}`;
    await axios
      .get(reverseURL, {
        headers: { Accept: "application/json" },
      })
      .then((response) => {
        const currentCity = {
          city: response.data[0].name,
          country: response.data[0].country,
          state: response.data[0].state ?? null,
        };
        setCurrCity(currentCity);
        saveLocation(
          cor.lat,
          cor.lon,
          currentCity.city,
          currentCity.country,
          currentCity.state,
        );
        setApiError("");
      })
      .catch((err) => {
        console.error(err);
        // If we already have a city from cache/saved location, don't show
        // the error screen — the dashboard is still usable with stale data.
        setCurrCity((prev) => {
          if (!prev) {
            // No city at all — try saved location as last resort
            const saved = loadSavedLocation();
            if (saved?.city && saved?.country) {
              return { city: saved.city, country: saved.country };
            }
            handleApiError(err, "error.reverseGeoFailed");
          }
          return prev;
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- closes over only stable state setters and a module-level constant
  }, []);

  // Called by the geolocation button in NavBarForm.
  // Feeds {lat, lon} directly into the existing coords → weather-fetch flow,
  // and kicks off reverse geocoding to update the header city name + persist location.
  const handleGeoCoords = useCallback(
    ({ lat, lon }) => {
      const cityCoords = { lat: Number(lat), lon: Number(lon) };

      // Update coords to trigger the existing data-fetching useEffects
      setCoords(cityCoords);
      setActiveIndex(0);

      // Reverse geocode to get the city name and save the new location
      findCityName(cityCoords);
    },
    [findCityName],
  );

  useEffect(() => {
    if (!OPEN_WEATHER_API_KEY) {
      setApiError("error.missingKey");
      return;
    }

    // Use saved location immediately — no geolocation prompt on return visits.
    const saved = loadSavedLocation();
    if (saved) {
      setCoords({ lat: saved.lat, lon: saved.lon });
      setCurrCity({ city: saved.city, country: saved.country });
      return;
    }

    // No saved location: request geolocation (first-time visitors or cleared storage).
    (async () => {
      let cityCoords;
      let getCoordinatesWithLocation = new Promise((resolve, reject) => {
        let opts = {
          enableHightAccuracy: true,
          timeout: 1000 * 10,
          maximumAge: 1000 * 60 * 5,
        };
        const success = (position) => {
          cityCoords = {
            lat: Number(position.coords.latitude),
            lon: Number(position.coords.longitude),
          };
          setCoords(cityCoords);
          findCityName(cityCoords); // persists weatherme:lastLocation after reverse geocode
          resolve(cityCoords);
        };
        const fail = () => {
          // Geolocation denied / unavailable — fall back to Istanbul.
          // findCityName will persist this too, so next visit skips the prompt.
          cityCoords = { lat: 41.01, lon: 28.66 };
          setCoords(cityCoords);
          findCityName(cityCoords);
          reject("Location is INACTIVE");
        };
        navigator.geolocation.getCurrentPosition(success, fail, opts);
      });
      await getCoordinatesWithLocation;
    })();
  }, [findCityName]);

  useEffect(() => {
    if (!OPEN_WEATHER_API_KEY) {
      return;
    }

    const findCoordinates = async () => {
      let coordinatesURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=5&appid=${OPEN_WEATHER_API_KEY}`;
      await axios
        .get(coordinatesURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          if (response.data.length > 0) {
            const cityCoords = {
              lat: Number(response.data[0].lat),
              lon: Number(response.data[0].lon),
            };
            const currentCity = {
              city: response.data[0].name,
              country: response.data[0].country,
              state: response.data[0].state ?? null,
            };
            setCoords(cityCoords);
            setCurrCity(currentCity);
            setActiveIndex(0);
            saveLocation(
              cityCoords.lat,
              cityCoords.lon,
              currentCity.city,
              currentCity.country,
              currentCity.state,
            );
            setApiError("");
          } else {
            // City not found: restore previous location from saved data
            const prev = loadSavedLocation();
            if (prev) {
              setCoords({ lat: prev.lat, lon: prev.lon });
              setCurrCity({ city: prev.city, country: prev.country });
              setActiveIndex(0);
            }
            setCityNotFound(true);
            setTimeout(() => setCityNotFound(false), 4000);
          }
        })
        .catch((err) => {
          console.error(err);
          // If we already have data on screen, don't blow it away with an error screen.
          // Show the "city not found" toast instead — the user can retry when online.
          if (weatherData) {
            setCityNotFound(true);
            setTimeout(() => setCityNotFound(false), 4000);
          } else {
            handleApiError(err, "error.cityNotFound");
          }
        });
    };
    if (searchCity !== null) {
      findCoordinates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-running on weatherData changes would retrigger geocoding
  }, [searchCity]);

  useEffect(() => {
    let isMounted = true;

    if (coords !== null && OPEN_WEATHER_API_KEY) {
      const isAlreadyLoaded =
        lastFetchedCoordsRef.current &&
        Math.abs(lastFetchedCoordsRef.current.lat - coords.lat) < 0.0001 &&
        Math.abs(lastFetchedCoordsRef.current.lon - coords.lon) < 0.0001;

      const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      const uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coords.lat}&lon=${coords.lon}&appid=${OPEN_WEATHER_API_KEY}`;

      const findWeather = async () => {
        try {
          const [
            currentResponse,
            forecastResponse,
            uviResponse,
            astroResponse,
          ] = await Promise.allSettled([
            axios.get(currentWeatherURL, {
              headers: { Accept: "application/json" },
            }),
            axios.get(forecastURL, {
              headers: { Accept: "application/json" },
            }),
            axios.get(uviURL, { headers: { Accept: "application/json" } }),
            fetchAstronomyData(
              coords.lat,
              coords.lon,
              use12h,
              currCityRef.current?.city,
            ),
          ]);

          if (
            currentResponse.status === "rejected" ||
            forecastResponse.status === "rejected" ||
            uviResponse.status === "rejected"
          ) {
            throw new Error("One or more weather requests failed");
          }

          if (!isMounted) return;

          const astronomy =
            astroResponse.status === "fulfilled" ? astroResponse.value : null;

          const payload = buildOpenWeatherPayload(
            currentResponse.value,
            forecastResponse.value,
            uviResponse.value,
          );

          setWeatherData(payload);
          setAstronomy(astronomy);
          lastFetchedCoordsRef.current = coords;
          lastFetchedFormatRef.current = use12h;
          setApiError("");
          setUsingCachedData(false);
          const now = Date.now();
          setLastUpdatedAt(now);
          saveWeatherCache(
            coords.lat,
            coords.lon,
            payload,
            airQuality,
            astronomy,
            use12h,
          );
        } catch (err) {
          if (!isMounted) return;
          console.error(err);
          // Try to serve stale cached data instead of showing a hard error
          const cache = loadWeatherCache(coords.lat, coords.lon);
          if (cache) {
            setWeatherData(cache.weatherData);
            setAirQuality(cache.airQuality);
            setLastUpdatedAt(cache.savedAt);
            setUsingCachedData(true);
            setApiError("");
          } else {
            handleApiError(err, "error.weatherFailed");
          }
        }
      };

      // Refetch when the coords are new or the hour format changed since the
      // last successful fetch — astronomy times are stored pre-formatted.
      const formatChanged = lastFetchedFormatRef.current !== use12h;

      if (!isAlreadyLoaded || formatChanged) {
        findWeather();
      } else {
        lastFetchedCoordsRef.current = coords;
      }

      // Poll every hour (1 hour = the cache freshness window)
      const intervalId = setInterval(findWeather, POLL_INTERVAL_MS);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cache writes intentionally use the latest snapshot without resetting the poll interval
  }, [coords, hourFormat]);

  useEffect(() => {
    let isMounted = true;

    if (coords !== null && OPEN_WEATHER_API_KEY) {
      const isAlreadyLoaded =
        lastFetchedCoordsRef.current &&
        Math.abs(lastFetchedCoordsRef.current.lat - coords.lat) < 0.0001 &&
        Math.abs(lastFetchedCoordsRef.current.lon - coords.lon) < 0.0001;

      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${OPEN_WEATHER_API_KEY}`;
      const findAirQuality = async () => {
        try {
          const response = await axios.get(airQualityURL, {
            headers: { Accept: "application/json" },
          });

          if (!isMounted) return;

          setAirQuality(response.data);
          lastFetchedCoordsRef.current = coords;
          setApiError("");
          setUsingCachedData(false);
          // Update cache with fresh air quality
          saveWeatherCache(coords.lat, coords.lon, weatherData, response.data);
        } catch (err) {
          if (!isMounted) return;
          console.error(err);
          // Try to serve stale cached data for air quality
          const cache = loadWeatherCache(coords.lat, coords.lon);
          if (cache && !airQuality) {
            setAirQuality(cache.airQuality);
            setLastUpdatedAt(cache.savedAt);
            setUsingCachedData(true);
            setApiError("");
          } else if (!cache) {
            handleApiError(err, "error.airPollutionFailed");
          }
        }
      };

      if (!isAlreadyLoaded) {
        findAirQuality();
      }

      // Poll every hour (1 hour = the cache freshness window)
      const intervalId = setInterval(findAirQuality, POLL_INTERVAL_MS);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cache writes intentionally use the latest snapshot without resetting the poll interval
  }, [coords]);

  const allPages = [
    {
      isPinned: true,
      city: currCity?.city || "",
      country: currCity?.country || "",
      state: currCity?.state ?? null,
      lat: coords?.lat,
      lon: coords?.lon,
      weatherData,
      airQuality,
      astronomy,
    },
    ...savedLocations.map((loc) => {
      const key = `${loc.lat},${loc.lon}`;
      const cached = savedWeatherData[key] || {};
      return {
        isPinned: false,
        city: loc.city,
        country: loc.country,
        state: loc.state ?? null,
        lat: loc.lat,
        lon: loc.lon,
        weatherData: cached.weatherData || null,
        airQuality: cached.airQuality || null,
        astronomy: cached.astronomy || null,
      };
    }),
  ];

  const activePage = allPages[activeIndex] || {};
  const activeWeatherData = activePage.weatherData;
  const activeAirQuality = activePage.airQuality;
  const activeCurrCity = activePage.city
    ? { city: activePage.city, country: activePage.country }
    : currCity;

  return (
    <WeatherContext.Provider
      value={{
        weatherData: activeWeatherData,
        airQuality: activeAirQuality,
        currCity: activeCurrCity,
      }}
    >
      {apiError ? (
        <Error message={t(apiError)} />
      ) : weatherData === null || airQuality === null || currCity === null ? (
        <Spinner />
      ) : (
        <Dashboard
          weatherData={weatherData}
          airQuality={airQuality}
          currCity={currCity}
          cityNotFound={cityNotFound}
          isUpdatingLocation={isUpdatingLocation}
          handleSearchCity={setSearchCity}
          handleWeatherData={setWeatherData}
          handleAirQuality={setAirQuality}
          handleCurrCity={setCurrCity}
          handleGeoCoords={handleGeoCoords}
          allPages={allPages}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          savedLocations={savedLocations}
          handleAddSavedLocation={addSavedLocation}
          handleRemoveLocation={removeSavedLocation}
          usingCachedData={usingCachedData}
          lastUpdatedAt={lastUpdatedAt}
        />
      )}
    </WeatherContext.Provider>
  );
};

export default Home;
