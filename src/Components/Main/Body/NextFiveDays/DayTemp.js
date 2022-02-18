import React from 'react'
import moment from "moment"
import {
  StyledDailyTemp,
  StyledImgContainer,
  StyledDailyIcon,
  StyledBulletContainer,
  StyledBullet,
  StyledDailyDegree,
} from "./StyledNextFiveDaysComponents";
const DayTemp = (props) => {
  const { weather, temp,dt } = props.data
  const temperature = Math.ceil(temp.day) 
  const { main, icon } = weather[0];
   const date = moment.unix(dt).format("MMMM DD");
  return (
    <StyledDailyTemp>
      <StyledBulletContainer temp={temperature}>
        <StyledDailyIcon
          src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
          alt="cloudy"
        />
        {/* <StyledBullet /> */}
      </StyledBulletContainer>
      <StyledDailyDegree>
        <span>{temperature}°</span>
        <span>{date}</span>
      </StyledDailyDegree>
    </StyledDailyTemp>
  );
}

export default DayTemp