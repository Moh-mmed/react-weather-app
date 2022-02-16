import { useState, useEffect, createContext } from "react";
import { Route, Routes } from "react-router-dom"
import WeatherContext from "./WeatherContext"
import './App.css';
import axios from "axios"
import Body from "./Components/Main/Body";
import Nav from "./Components/Main/NavBar";
import SideBar from "./Components/SideBar";
import TodaysTemperatures from "./Components/Main/Body/TodaysTemperatures";
import NextFiveDays from "./Components/Main/Body/NextFiveDays";
import ErrorPage from './Components/ErrorPage'


function App() {
  const [searchCity, setSearchCity] = useState(null)
  const [currCity, setCurrCity] = useState(null)
  const [coords, setCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [isLoading, setIsLoading] = useState(false)


  const KEY = "99eb51721a50689c8175af2560a2b07c";
  
  // const handleSearchCity = async (e) => {
  //   await setSearchCity(e)
  // };

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
          // setCurrCity(response.data[0].name);
          setCurrCity({
            city: response.data[0].name,
            country: response.data[0].country,
          });
          setSearchCity(response.data[0].name)
        })
        .catch((err) => {
          console.log(err);
        });
    };
    if (coordinates !== null) {
      setCoords(coordinates);
      findCityName(coordinates);
    } else {
      const getLocation = async () => {
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
      };
      getLocation();
    }
  },[])

  // Find coordinates for entered city 
  useEffect(() => {
  const findCoordinates = async () => {
      let coordinatesURL = `http://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=5&appid=${KEY}`;
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
            setCoords(cityCoords);
            setCurrCity({
            city: response.data[0].name,
            country: response.data[0].country,
            });
            console.log(response.data)
            localStorage.setItem("coordinates", JSON.stringify(cityCoords));
          } else {
             console.log("You entered a wrong city");
          }
        })
        .catch((err) => {
          console.log(err);
        });
  };
    if (searchCity !== null) {
     findCoordinates();
  }
  }, [searchCity]);


// Find Weather data
  useEffect(() => {
    if (coords !== null) {
    const findWeather = async () => {
      const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${KEY}`;
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
      const findAirQuality = async () => {
        const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${KEY}`;
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
    <WeatherContext.Provider value={{ weatherData, airQuality, currCity }}>
      <div className="App">
        {weatherData === null || airQuality === null ? (
          <div>Loading</div>
        ) : (
          <>
            <div className="Main">
              <Nav city={searchCity} handleSearchCity={setSearchCity} />
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