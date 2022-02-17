import React from 'react'
import {
  StyledDailyTemp,
  StyledImgContainer,
  StyledDailyIcon,
  StyledBulletContainer,
  StyledBullet,
  StyledDailyDegree,
} from "./StyledTodaysWeatherComponents";
const DayTemp = (props) => {
  const { time, data, season } = props
  const { temperature, icon } = data;
  return (
    <StyledDailyTemp>
      <StyledBulletContainer temp={temperature} season={season}>
        <StyledImgContainer>
          <StyledDailyIcon
            src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
            alt="cloudy"
          />
        </StyledImgContainer>
        <StyledBullet />
      </StyledBulletContainer>
      <StyledDailyDegree>
        <span>{temperature}°</span>
        <span>{time}</span>
      </StyledDailyDegree>
    </StyledDailyTemp>
  );
}

export default DayTemp