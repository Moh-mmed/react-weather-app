import { createContext } from "react";
const WeatherContext = createContext({
  weatherData: null,
  currCity: null,
  airQuality: null,
});
export default WeatherContext