import React from 'react';
import WeatherContext from "../../../../WeatherContext";
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
    <WeatherContext.Consumer>
      {({ airQuality, weatherData }) => {
        if (airQuality !== null && weatherData !== null) {
         let {
          clouds,
          feels_like,
          humidity,
          pressure,
          temp,
          visibility,
          weather,
          } = weatherData.current;
          console.log(weatherData.current);
          feels_like = Math.round(feels_like); 
          temp = Math.round(temp); 
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
                  <span>{feels_like}°C</span>
                  <span>{temp}°C</span>
                </StyledDegree>
                <StyledCondition>Partly Cloudy</StyledCondition>
              </div>
              <StyledStats>
                <div>
                  <span>pressure</span>
                  <span>{pressure}mb</span>
                </div>
                <div>
                  <span>visibility</span>
                  <span>4.3 km</span>
                </div>
                <div>
                  <span>humidity</span>
                  <span>{humidity}%</span>
                </div>
              </StyledStats>
            </StyledWeatherContainer>
          );
        } else {
          return <div>Loading...</div>;
        };
      }}
    </WeatherContext.Consumer>
  );
};

export default Weather;
