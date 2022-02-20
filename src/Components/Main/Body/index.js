import Weather from "./Weather";
import AirQuality from "./AirQuality";
import TodaysTemperatures from "./TodaysTemperatures";
import NextFiveDays from "./NextFiveDays";
import { StyledBodyContainer } from "./StyledBodyContainer";
import { useContext } from "react";
import WeatherContext from "../../../contexts/WeatherContext";

const Body = ({ children }) => {
  const {nextFiveDays} = useContext(WeatherContext)
  return (
    <>
      {children}
      <StyledBodyContainer>
        <Weather />
        <AirQuality />
        {!nextFiveDays ? <TodaysTemperatures /> : <NextFiveDays />}
      </StyledBodyContainer>
    </>
  );
};

export default Body;
