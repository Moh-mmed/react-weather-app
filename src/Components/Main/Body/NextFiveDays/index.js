import React, { useContext, useState } from "react";
import moment from "moment"
import WeatherContext from "../../../../WeatherContext";
import DayTemp from './DayTemp';
import {
  StyledTemperatures,
  StyledTempHeading,
  StyledHeading,
  StyledTodaysWeather,
} from "./StyledNextFiveDaysComponents";

const NextFiveDays = () => {
  const { weatherData } = useContext(WeatherContext);
  const [todayTemperatures, setTodayTemperatures] = useState([]);
  const nextFiveDaysWeather = weatherData.daily.slice(3);
console.log(nextFiveDaysWeather)
  return (
    <StyledTodaysWeather>
      <StyledTempHeading>
        <StyledHeading>
          Next five days' weather 
        </StyledHeading>
      </StyledTempHeading>
      <StyledTemperatures>
        {nextFiveDaysWeather.length === 5 &&
          nextFiveDaysWeather.map((day,index) => <DayTemp data={day} key={index} />)}
      </StyledTemperatures>
    </StyledTodaysWeather>
  ); 
};

export default NextFiveDays;
