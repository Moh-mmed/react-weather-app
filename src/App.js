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
  const [coords, setCoords] = useState(null)
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null);
  const [isLoading, setIsLoading] = useState(false)


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
          setCurrCity(response.data[0].name);
        })
        .catch((err) => {
          setCurrCity("Unknown");
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
              lat: Number(position.coords.latitude.toFixed(2)),
              lon: Number(position.coords.longitude.toFixed(2)),
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
              lat: Number(response.data[0].lat.toFixed(2)),
              lon: Number(response.data[0].lon.toFixed(2)),
            };
            setCoords(cityCoords);
            setCurrCity(response.data[0].name)
            localStorage.setItem("coordinates", JSON.stringify(cityCoords));
          } else {
             console.log("You entered a wrong city");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    if (searchCity !== null ) {
     findCoordinates();
    }
  }, [searchCity]);


// Find Weather data
  useEffect(() => {
    setIsLoading(true)
    if (coords !== null) {
    const findWeather = async () => {
      const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${KEY}`;
      await axios
        .get(weatherURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          setWeather(response.data);
          setIsLoading(false)
        })
        .catch((err) => {
          setWeather(console.log(err));
          setIsLoading(false);
        });
    };
    findWeather();
  }
 }, [coords]);


// Find Air Quality
  useEffect(() => {
    setIsLoading(true);
    if (coords !== null) {
      const findAirQuality = async () => {
        const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${KEY}`;
        await axios
          .get(airQualityURL, {
            headers: { Accept: "application/json" },
          })
          .then((response) => {
            setAirQuality(response.data);
            setIsLoading(false);
          })
          .catch((err) => {
            setAirQuality(console.log(err));
            setIsLoading(false);
          });
      };
      findAirQuality();
    }
  }, [coords]); 

  return (
    <WeatherContext.Provider value={{ weather, airQuality, currCity, isLoading }}>
      <div className="App">
        {isLoading ? (
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