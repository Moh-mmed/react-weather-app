import React from 'react';
<<<<<<< HEAD
import { StyledTodaysWeather } from "./StyledTodaysWeatherComponents";

const TodaysTemperatures = () => {
  return (<StyledTodaysWeather>
    Todays temperatures
  </StyledTodaysWeather>);
=======
import {
  StyledTemperatures,
  StyledTempHeading,
  StyledHeading,
  StyledTempTomorrow,
  StyledTodaysWeather,
  StyledDailyTemp,
  StyledImgContainer,
  StyledDailyIcon,
  StyledBulletContainer,
  StyledBullet,
  StyledDailyDegree,
} from "./StyledTodaysWeatherComponents";
import cloudy from "../../../../imgs/all-cloudy.png"
import partlyCloudy from "../../../../imgs/partly-cloudy-icon.png"
import snowy from "../../../../imgs/heavy-snow-icon.png"
import lightSnow from "../../../../imgs/light-snow-icon.png"
import sunny from "../../../../imgs/sunny-icon.png"
const TodaysTemperatures = () => {
  return (
    <StyledTodaysWeather>
      <StyledTempHeading>
        <StyledHeading>
          How's the <br />
          temperature today?
        </StyledHeading>
      </StyledTempHeading>
      <StyledTempTomorrow>
        <div>Tomorrow</div>
        <div>
          <span>20°c</span>
          <span>rainy</span>
        </div>
      </StyledTempTomorrow>
      <StyledTemperatures>
        <StyledDailyTemp>
          <StyledBulletContainer variant={0}>
            <StyledImgContainer>
              <StyledDailyIcon src={cloudy} alt="cloudy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>0°</span>
            <span>morning</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
        <StyledDailyTemp>
          <StyledBulletContainer variant={10}>
            <StyledImgContainer>
              <StyledDailyIcon src={snowy} alt="snowy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>10°</span>
            <span>afternoon</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
        <StyledDailyTemp>
          <StyledBulletContainer variant={3}>
            <StyledImgContainer>
              <StyledDailyIcon src={partlyCloudy} alt="partly cloudy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>3°</span>
            <span>evening</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
        <StyledDailyTemp>
          <StyledBulletContainer variant={-1}>
            <StyledImgContainer>
              <StyledDailyIcon src={sunny} alt="cloudy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>-1°</span>
            <span>night</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
      </StyledTemperatures>
    </StyledTodaysWeather>
  );
>>>>>>> 43d0e9c (finishing main design)
};

export default TodaysTemperatures;
