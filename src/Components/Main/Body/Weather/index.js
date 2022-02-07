import React from 'react';
import img from "../../../../imgs/cloudy-day.png";
import {
  StyledWeatherContainer,
  StyledHeading,
  StyledImgContainer,
  StyledImg,
  StyledDesc,
  StyledDegree,
  StyledCondition,
  StyledStats,
} from "./StyledWeatherComponents";

const Weather = () => {
  return (
    <StyledWeatherContainer>
      <StyledHeading>
        <StyledImgContainer>
          <StyledImg src={img} alt="wind img" />
        </StyledImgContainer>
        <StyledDesc>
          <span>Weather</span>
          <span>What's the weather?</span>
        </StyledDesc>
      </StyledHeading>
      <div>
        <StyledDegree>
          <span>22°C</span>
          <span>11°C</span>
        </StyledDegree>
        <StyledCondition>Partly Cloudy</StyledCondition>
      </div>
      <StyledStats>
        <div>
          <span>pressure</span>
          <span>800mb</span>
        </div>
        <div>
          <span>visibility</span>
          <span>4.3 km</span>
        </div>
        <div>
          <span>humidity</span>
          <span>87%</span>
        </div>
      </StyledStats>
    </StyledWeatherContainer>
  );
};

export default Weather;
