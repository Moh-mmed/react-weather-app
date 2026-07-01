import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css";
import WeatherContext from "../contexts/WeatherContext";
import Nav from "./Main/NavBar";
import Body from "./Main/Body";
import SideBar from "./SideBar";
import Spinner from "./Spinner";
import Error from "./Error";
import { OPEN_WEATHER_API_KEY } from "../helpers/openWeather";
import { buildOpenWeatherPayload } from "../helpers/openWeatherAdapter";




const Home = () => {
  const [searchCity, setSearchCity] = useState(null);
  const [currCity, setCurrCity] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [cityNotFound, setCityNotFound] = useState(false);
  const [nextFiveDays, setNextFiveDays] = useState(false);
  const [apiError, setApiError] = useState("");

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

  //Find coordinates using location
  // first we check if localStorage has saved coordinates, if not we get coordinates using Location API
  // If user turn on location, the user should ask for detecting coordinates using location
  useEffect(() => {
    if (!OPEN_WEATHER_API_KEY) {
      setApiError(
        "Missing REACT_APP_OPENWEATHER_API_KEY. Create a .env file with a valid OpenWeather key."
      );
      return;
    }

    let coordinates = JSON.parse(localStorage.getItem("coordinates"));
    // Find city name
    const findCityName = async (cor) => {
      const reverseURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${cor.lat}&lon=${cor.lon}&limit=5&appid=${OPEN_WEATHER_API_KEY}`;
      await axios
        .get(reverseURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          let currentCity = {
            city: response.data[0].name,
            country: response.data[0].country,
          };
          setCurrCity(currentCity);
          localStorage.setItem("currentCity", JSON.stringify(currentCity));
          setApiError("");
        })
        .catch((err) => {
          console.log(err);
          handleApiError(err, "Unable to resolve the current city from your location.");
        });
    };
    if (coordinates !== null) {
      setCoords(coordinates);
      findCityName(coordinates);
    } else {
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
            localStorage.setItem("coordinates", JSON.stringify(cityCoords));
            setCoords(cityCoords);
            findCityName(cityCoords);
            resolve(cityCoords);
          };
          const fail = (err) => {
            // Istanbul coordinates as default
            cityCoords = { lat: 41.01, lon: 28.66 };
            localStorage.setItem("coordinates", JSON.stringify(cityCoords));
            setCoords(cityCoords);
            findCityName(cityCoords);
            reject("Location is INACTIVE");
          };
          navigator.geolocation.getCurrentPosition(success, fail, opts);
        });
        await getCoordinatesWithLocation;
      })();
    }
  }, []);

  // Find coordinates for entered city
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
            let cityCoords = {
              lat: Number(response.data[0].lat),
              lon: Number(response.data[0].lon),
            };
            let currentCity = {
              city: response.data[0].name,
              country: response.data[0].country,
            };
            setCoords(cityCoords);
            setCurrCity(currentCity);
            localStorage.setItem("coordinates", JSON.stringify(cityCoords));
            localStorage.setItem("currentCity", JSON.stringify(currentCity));
            setApiError("");
          } else {
            setCityNotFound(true);
            setCoords(JSON.parse(localStorage.getItem("coordinates")));
            setCurrCity(JSON.parse(localStorage.getItem("currentCity")));
            setTimeout(() => setCityNotFound(false), 4000);
          }
        })
        .catch((err) => {
          console.log(err);
          handleApiError(err, "Unable to look up that city right now.");
        });
    };
    // If the searchCity is null means coordinates already exist
    if (searchCity !== null) {
      findCoordinates();
    }
  }, [searchCity]);

  // Find Weather data
  useEffect(() => {
    let isMounted = true;

    if (coords !== null && OPEN_WEATHER_API_KEY) {
      const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      const uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coords.lat}&lon=${coords.lon}&appid=${OPEN_WEATHER_API_KEY}`;

      const findWeather = async () => {
        try {
          const [currentResponse, forecastResponse, uviResponse] = await Promise.all([
            axios.get(currentWeatherURL, { headers: { Accept: "application/json" } }),
            axios.get(forecastURL, { headers: { Accept: "application/json" } }),
            axios.get(uviURL, { headers: { Accept: "application/json" } }),
          ]);

          if (!isMounted) return;

          const payload = buildOpenWeatherPayload(
            currentResponse,
            forecastResponse,
            uviResponse
          );

          setWeatherData(payload);
          setApiError("");
        } catch (err) {
          if (!isMounted) return;
          console.log(err);
          handleApiError(err, "Unable to load the weather forecast.");
        }
      };
      findWeather();
    }

    return () => {
      isMounted = false;
    };
  }, [coords]);

  // Find Air Quality
  useEffect(() => {
    if (coords !== null && OPEN_WEATHER_API_KEY) {
      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${OPEN_WEATHER_API_KEY}`;
      const findAirQuality = async () => {
        await axios
          .get(airQualityURL, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            setAirQuality(response.data);
            setApiError("");
          })
          .catch((err) => {
            console.log(err);
            handleApiError(err, "Unable to load the air quality report.");
          });
      };
      findAirQuality();
    }
  }, [coords]);

  return (
    <WeatherContext.Provider
      value={{ weatherData, airQuality, currCity, nextFiveDays }}
    >
      <div className="App">
        {apiError ? (
          <Error message={apiError} />
        ) : weatherData === null || airQuality === null || currCity === null ? (
          <Spinner />
        ) : (
          <>
            <div className="Main">
              <Nav
                city={searchCity}
                cityNotFound={cityNotFound}
                handleSearchCity={setSearchCity}
                handleWeatherData={setWeatherData}
                handleAirQuality={setAirQuality}
                handleCurrCity={setCurrCity}
                handleCityNotFound={setCityNotFound}
              />
              <Body />
            </div>
            <div className="Side-Bar">
              <SideBar handleNextFiveDaysDisplay={setNextFiveDays} />
            </div>
          </>
        )}
      </div>
    </WeatherContext.Provider>
  );
};

export default Home;
