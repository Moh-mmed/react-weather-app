import React from 'react'
import moment from "moment"
import {
  StyledDailyTemp,
  StyledDailyIcon,
  StyledDailyDegree,
} from "./StyledNextFiveDaysComponents";
const DayTemp = (props) => {
  const { weather, temp,dt } = props.data
  const temperature = Math.ceil(temp.day) 
  const { main, icon } = weather[0];
   const date = moment.unix(dt).format("MMMM DD");
  return (
    <StyledDailyTemp>
      <StyledDailyIcon
        src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
        alt="cloudy"
      />
      <StyledDailyDegree>
        <span>{temperature}°</span>
        <span>{main}</span>
        <span>{date}</span>
      </StyledDailyDegree>
    </StyledDailyTemp>
  );
}

export default DayTemp