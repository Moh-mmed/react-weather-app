import { createContext } from "react";
const WeatherContext = createContext({
  weatherData: "",
  currCity: "Istanbul",
  airQuality: "",
});
export default WeatherContext