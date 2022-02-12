import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom"
import axios from "axios"
import './App.css';
import Body from "./Components/Main/Body";
import Nav from "./Components/Main/NavBar";
import SideBar from "./Components/SideBar";
import TodaysTemperatures from "./Components/Main/Body/TodaysTemperatures";
import NextFiveDays from "./Components/Main/Body/NextFiveDays";
import ErrorPage from './Components/ErrorPage'
function App() {
  const [searchCity, setSearchCity] = useState("istanbul")
  const [coords, setCoords] = useState({ lat: 41.01, lon: 28.91})
  const [data, setData] = useState()
  const findWeather = async () => {
      const KEY = "99eb51721a50689c8175af2560a2b07c";
      const URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${KEY}`;
      const response = await axios.get(URL, {
        headers: { Accept: "application/json" },
      });
    setData(response.data);
    console.log("Finding weather")
  }
  const handleSearchCity = (e) => {
    setSearchCity(e);
  }

  const getLocation = () => {
    let opts = {
      enableHightAccuracy: true,
      timeout: 1000 * 10,
      maximumAge: 1000 * 60 * 5
    }
    let fail = (err) => console.log(err);
    let success = (position) => {
      setCoords({
        lat: Number(position.coords.latitude.toFixed(2)),
        lon: Number(position.coords.longitude.toFixed(2))
      })
    };
    navigator.geolocation.getCurrentPosition(success, fail, opts);
  }

  useEffect(() => {
    getLocation();
    //API call
    findWeather()
    console.log(data);
  }, [searchCity]);
  
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
