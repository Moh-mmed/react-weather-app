import { useState, useEffect} from "react";
import { Route, Routes } from "react-router-dom"
import WeatherContext from "./WeatherContext"
import './App.css';
import axios from "axios"
import Body from "./Components/Main/Body";
import Nav from "./Components/Main/NavBar";
import SideBar from "./Components/SideBar";
import TodaysTemperatures from "./Components/Main/Body/TodaysTemperatures";
import NextFiveDays from "./Components/Main/Body/NextFiveDays";
import Spinner from "./Spinner";
import ErrorPage from './Components/ErrorPage'


function App() {
  const [searchCity, setSearchCity] = useState(null)
  const [currCity, setCurrCity] = useState(null)
  const [coords, setCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [cityNotFound, setCityNotFound] = useState(false)

  const KEY = "99eb51721a50689c8175af2560a2b07c";

  //Find coordinates using location
  // first we check if localStorage has saved coordinates, if not we get coordinates using Location API
  // If user turn on location, the user should ask for detecting coordinates using location
  useEffect(() => {
    console.log("find location")
    let coordinates = JSON.parse(localStorage.getItem("coordinates"));
    // Find city name
    const findCityName = async (cor) => {
      console.log("Axios running")
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
          console.log("location's found")
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
              lon: Number(position.coords.longitude)
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
  },[])

  // Find coordinates for entered city 
  useEffect(() => {
  console.log("find coordinates")
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
            console.log("coordinates are found")
          } else {
            console.log("You entered a wrong city");
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
    console.log("Find coordinates is running...")
    findCoordinates();
  };
  }, [searchCity]);

// Find Weather data
  useEffect(() => {
    console.log("find weather");
    if (coords !== null) {
      console.log("Inside Weather")
      const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${KEY}`;
      const findWeather = async () => {
        await axios
          .get(weatherURL, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            console.log("weather's found");
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
    console.log("find air quality");
    if (coords !== null) {
      console.log("Inside air quality")
      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${KEY}`;
      const findAirQuality = async () => {
        await axios
          .get(airQualityURL, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            console.log("air quality's found");
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
    <WeatherContext.Provider value={{ weatherData, airQuality, currCity }}>
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
              <Routes>
                <Route path="/" element={<Body />}>
                  <Route index element={<TodaysTemperatures />} />
                  <Route
                    path="/todays-temperatures"
                    element={<TodaysTemperatures />}
                  />
                  <Route path="/next-five-days" element={<NextFiveDays />} />
                </Route>
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </div>
            <div className="Side-Bar">
              <SideBar />
            </div>
          </>
        )}
      </div>
    </WeatherContext.Provider>
  );
}

export default App;