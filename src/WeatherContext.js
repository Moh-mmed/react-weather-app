import { createContext } from "react";
const WeatherContext = createContext({ data: "unknown", currCity: "Istanbul" });

export default WeatherContext