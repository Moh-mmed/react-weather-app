import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom"
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
  const [coords, setCoords] = useState(null)
  const [data, setData] = useState(null)
  const KEY = "99eb51721a50689c8175af2560a2b07c";
  
  
  const handleSearchCity = (e) => {
    setSearchCity(e);
  }

  //Find coordinates using location
  const getLocation = async () => {
    let coordinates;
    let opts = {
      enableHightAccuracy: true,
      timeout: 1000 * 10,
      maximumAge: 1000 * 60 * 5
    }
    let fail = (err) => console.log(err);
    let success = (position) => {
      coordinates = {
        lat: Number(position.coords.latitude.toFixed(2)),
        lon: Number(position.coords.longitude.toFixed(2)),
      }; 
      setCoords(coordinates);
      // localStorage.setItem("coordinates", JSON.stringify(coordinates));
    };
    await navigator.geolocation.getCurrentPosition(success, fail, opts);
  }
  

  useEffect(() => {
 
  const findCoordinates = async () => {
      let coordinatesURL = `http://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=5&appid=${KEY}`;
      await axios
        .get(coordinatesURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          if (response.data.length > 0) {
            setCoords({
              lat: Number(response.data[0].lat.toFixed(2)),
              lon: Number(response.data[0].lon.toFixed(2)),
            });
            setSearchCity(response.data[0].name);
          } else {
             console.log("You entered a wrong city");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };

  //  let coordinates = JSON.parse(localStorage.getItem('coordinates')) || getLocation();
   getLocation()
  //  console.log(coords)
    if (searchCity !== null) {
     findCoordinates();
     console.log("Search city is running")
    }
    
  }, [searchCity]);

  useEffect(() => {
  console.log("4");
    const findWeather = async () => {
     const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${KEY}`;
     await axios
       .get(weatherURL, {
         headers: { Accept: "application/json" },
       })
       .then((response) => {
         setData(response.data);
         console.log(response.data)
       })
       .catch((err) => {
         setData(console.log(err));
       });
    };
    const findCityName = async () => {
      const reverseURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.lat}&lon=${coords.lon}&limit=5&appid=${KEY}`;
       await axios
         .get(reverseURL, {
           headers: { Accept: "application/json" },
         })
         .then((response) => {
           setSearchCity(response.data[0].name)
           console.log(response.data);
         })
         .catch((err) => {
          //  setData(console.log(err));
         });
    };
    if (coords !== null) {
      findWeather()
      findCityName();
    }
 }, [coords]);


  return (
    <div className="App">
      <div className="Main">
        <Nav city={searchCity} handleSearchCity={handleSearchCity} />
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
    </div>
  );
}

export default App;
