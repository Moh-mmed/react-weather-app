import { createContext } from "react";
const WeatherContext = createContext({
  weather: "",
  currCity: "Istanbul",
    airQuality: "",
});
export default WeatherContext