import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css";
import WeatherContext from "../contexts/WeatherContext";
import Nav from "./Main/NavBar";
import Body from "./Main/Body";
import SideBar from "./SideBar";
import Spinner from "./Spinner";




const Home = () => {
  const [searchCity, setSearchCity] = useState(null);
  const [currCity, setCurrCity] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [cityNotFound, setCityNotFound] = useState(false);
  const [nextFiveDays, setNextFiveDays] = useState(false);

  const KEY = "99eb51721a50689c8175af2560a2b07c";

  //Find coordinates using location
  // first we check if localStorage has saved coordinates, if not we get coordinates using Location API
  // If user turn on location, the user should ask for detecting coordinates using location
  useEffect(() => {
    let coordinates = JSON.parse(localStorage.getItem("coordinates"));
    // Find city name
    const findCityName = async (cor) => {
      const reverseURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${cor.lat}&lon=${cor.lon}&limit=5&appid=${KEY}`;
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
        })
        .catch((err) => {
          console.log(err);
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
            localStorage.setItem("coordinates", JSON.stringify(coords));
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
    const findCoordinates = async () => {
      let coordinatesURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=5&appid=${KEY}`;
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
          } else {
            setCityNotFound(true);
            setCoords(JSON.parse(localStorage.getItem("coordinates")));
            setCurrCity(JSON.parse(localStorage.getItem("currentCity")));
            setTimeout(() => setCityNotFound(false), 4000);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    // If the searchCity is null means coordinates already exist
    if (searchCity !== null) {
      findCoordinates();
    }
  }, [searchCity]);

  // Find Weather data
  useEffect(() => {
    if (coords !== null) {
      const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${KEY}`;
      const findWeather = async () => {
        await axios
          .get(weatherURL, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            setWeatherData(response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      };
      findWeather();
    }
  }, [coords]);

  // Find Air Quality
  useEffect(() => {
    if (coords !== null) {
      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${KEY}`;
      const findAirQuality = async () => {
        await axios
          .get(airQualityURL, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            setAirQuality(response.data);
          })
          .catch((err) => {
            console.log(err);
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
        {weatherData === null || airQuality === null || currCity === null ? (
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
