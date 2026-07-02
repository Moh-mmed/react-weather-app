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
  const { time, data, season } = props;
  const temperature = data?.temperature ?? 0;
  const icon = data?.icon ?? "01d";

  return (
    <StyledDailyTemp>
      <StyledBulletContainer temp={temperature} season={season}>
        <StyledImgContainer>
          <StyledDailyIcon
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
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