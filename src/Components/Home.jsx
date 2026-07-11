import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

import WeatherContext from "../contexts/WeatherContext";
import Dashboard from "./Dashboard";
import Spinner from "./Spinner";
import Error from "./Error";
import { OPEN_WEATHER_API_KEY } from "../helpers/openWeather";
import { buildOpenWeatherPayload } from "../helpers/openWeatherAdapter";

// Session-level flag to avoid duplicate warnings for One Call 3.0 fallback
let hasLoggedOneCallFallback = false;

// ─── Location persistence ──────────────────────────────────────────────────
const LOCATION_KEY = "weatherme:lastLocation";

/**
 * Persist the user's most recent location so the next visit loads instantly
 * without waiting on a geolocation permission prompt.
 */
const saveLocation = (lat, lon, city, country, state) => {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lon, city, country, state: state ?? null }));
  } catch (_) {
    // localStorage unavailable (private browsing / quota exceeded) — fail silently
  }
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
        return { lat: p.lat, lon: p.lon, city: p.city, country: p.country, state: p.state ?? null };
      }
    }
    // Migration: read legacy separate keys so existing users don't lose their location
    const oldCoords = JSON.parse(localStorage.getItem("coordinates"));
    const oldCity   = JSON.parse(localStorage.getItem("currentCity"));
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
  const [searchCity, setSearchCity] = useState(null);
  const [currCity, setCurrCity] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [cityNotFound, setCityNotFound] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Saved locations state & data cache
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const saved = localStorage.getItem("weatherme:savedLocations");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [savedWeatherData, setSavedWeatherData] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);

  const lastFetchedCoordsRef = useRef(null);

  const handleApiError = (err, fallbackMessage) => {
    const status = err?.response?.status;
    if (status === 401) {
      setApiError(
        "OpenWeather rejected the request. Add a valid REACT_APP_OPENWEATHER_API_KEY to your .env file."
      );
      return;
    }

    setApiError(fallbackMessage);
  };

  // Persist saved locations list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weatherme:savedLocations", JSON.stringify(savedLocations));
    } catch (_) {}
  }, [savedLocations]);

  const addSavedLocation = useCallback((loc) => {
    const isDuplicate = savedLocations.some(
      (item) =>
        Math.abs(item.lat - loc.lat) < 0.01 && Math.abs(item.lon - loc.lon) < 0.01
    );
    if (!isDuplicate) {
      setSavedLocations((prev) => {
        const next = [...prev, loc];
        // Automatically scroll to the newly added location page
        setActiveIndex(next.length);
        return next;
      });
    }
  }, [savedLocations]);

  const removeSavedLocation = useCallback((lat, lon) => {
    setSavedLocations((prev) =>
      prev.filter((item) => !(Math.abs(item.lat - lat) < 0.01 && Math.abs(item.lon - lon) < 0.01))
    );
    setSavedWeatherData((prev) => {
      const next = { ...prev };
      const key = Object.keys(next).find(k => {
        const [klat, klon] = k.split(",").map(Number);
        return Math.abs(klat - lat) < 0.01 && Math.abs(klon - lon) < 0.01;
      });
      if (key) delete next[key];
      return next;
    });
  }, []);

  const fetchWeatherDataForLocation = useCallback(async (lat, lon) => {
    const key = `${lat},${lon}`;
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
    const uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`;
    const oneCallURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
    const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`;

    try {
      const [currentResponse, forecastResponse, uviResponse, airQualityResponse] = await Promise.all([
        axios.get(currentWeatherURL, { headers: { Accept: "application/json" } }),
        axios.get(forecastURL, { headers: { Accept: "application/json" } }),
        axios.get(uviURL, { headers: { Accept: "application/json" } }),
        axios.get(airQualityURL, { headers: { Accept: "application/json" } }),
      ]);

      let oneCallResponse = null;
      try {
        oneCallResponse = await axios.get(oneCallURL, {
          headers: { Accept: "application/json" },
        });
      } catch (oneCallErr) {
        // ignore or fallback
      }

      const payload = buildOpenWeatherPayload(
        currentResponse,
        forecastResponse,
        uviResponse,
        oneCallResponse
      );

      setSavedWeatherData((prev) => ({
        ...prev,
        [key]: {
          weatherData: payload,
          airQuality: airQualityResponse.data,
        },
      }));
    } catch (err) {
      console.error(`Failed to fetch weather for location ${lat}, ${lon}:`, err);
    }
  }, []);

  // Lazy pre-fetching effect
  useEffect(() => {
    if (!OPEN_WEATHER_API_KEY) return;

    // Fetch active index and neighbors (e.g. index-1, index+1) if they are saved locations
    const indicesToFetch = [activeIndex, activeIndex - 1, activeIndex + 1].filter(
      (idx) => idx > 0 && idx <= savedLocations.length
    );

    indicesToFetch.forEach((idx) => {
      const loc = savedLocations[idx - 1];
      const key = `${loc.lat},${loc.lon}`;
      if (savedWeatherData[key]) return; // already cached!

      fetchWeatherDataForLocation(loc.lat, loc.lon);
    });
  }, [activeIndex, savedLocations, savedWeatherData, fetchWeatherDataForLocation]);

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
        saveLocation(cor.lat, cor.lon, currentCity.city, currentCity.country, currentCity.state);
        setApiError("");
      })
      .catch((err) => {
        console.error(err);
        handleApiError(err, "Unable to resolve the current city from your location.");
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
    [findCityName]
  );

  useEffect(() => {
    if (!OPEN_WEATHER_API_KEY) {
      setApiError(
        "Missing REACT_APP_OPENWEATHER_API_KEY. Create a .env file with a valid OpenWeather key."
      );
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
            saveLocation(cityCoords.lat, cityCoords.lon, currentCity.city, currentCity.country, currentCity.state);
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
          handleApiError(err, "Unable to look up that city right now.");
        });
    };
    if (searchCity !== null) {
      findCoordinates();
    }
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
      const oneCallURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=minutely,alerts&units=metric&appid=${OPEN_WEATHER_API_KEY}`;

      const findWeather = async () => {
        try {
          const [currentResponse, forecastResponse, uviResponse] = await Promise.all([
            axios.get(currentWeatherURL, { headers: { Accept: "application/json" } }),
            axios.get(forecastURL, { headers: { Accept: "application/json" } }),
            axios.get(uviURL, { headers: { Accept: "application/json" } }),
          ]);

          let oneCallResponse = null;

          try {
            oneCallResponse = await axios.get(oneCallURL, {
              headers: { Accept: "application/json" },
            });
          } catch (oneCallErr) {
            if (!hasLoggedOneCallFallback) {
              console.info(
                "[weather] One Call 3.0 not available on this API plan — using fallback"
              );
              hasLoggedOneCallFallback = true;
            }
          }

          if (!isMounted) return;

          const payload = buildOpenWeatherPayload(
            currentResponse,
            forecastResponse,
            uviResponse,
            oneCallResponse
          );

          setWeatherData(payload);
          lastFetchedCoordsRef.current = coords;
          setApiError("");
        } catch (err) {
          if (!isMounted) return;
          console.error(err);
          handleApiError(err, "Unable to load the weather forecast.");
        }
      };

      if (!isAlreadyLoaded) {
        findWeather();
      } else {
        lastFetchedCoordsRef.current = coords;
      }

      // Poll every 10 minutes (600,000 ms)
      const intervalId = setInterval(findWeather, 10 * 60 * 1000);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }
  }, [coords]);

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
        } catch (err) {
          if (!isMounted) return;
          console.error(err);
          handleApiError(err, "Unable to load the air quality report.");
        }
      };

      if (!isAlreadyLoaded) {
        findAirQuality();
      }

      // Poll every 10 minutes (600,000 ms)
      const intervalId = setInterval(findAirQuality, 10 * 60 * 1000);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }
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
      };
    }),
  ];

  const activePage = allPages[activeIndex] || {};
  const activeWeatherData = activePage.weatherData || weatherData;
  const activeAirQuality = activePage.airQuality || airQuality;
  const activeCurrCity = activePage.city ? { city: activePage.city, country: activePage.country } : currCity;

  return (
    <WeatherContext.Provider value={{ weatherData: activeWeatherData, airQuality: activeAirQuality, currCity: activeCurrCity }}>
      {apiError ? (
        <Error message={apiError} />
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
        />
      )}
    </WeatherContext.Provider>
  );
};

export default Home;
