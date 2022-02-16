import React from 'react';
import WeatherContext from "../../../../WeatherContext";
import {
  sunny_day,
  partly_cloudy_day,
  cloudy_day,
  snowy_day,
  rainy_day,
  shower_day,
  thunderstorm_day,
  foggy_day,
} from './Images'
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

const setBackgroundImg = (forecast, id) => {
  forecast = forecast.toLowerCase();
  switch (forecast) {
    case "rain":
      if(id >=500 && id<=504) return rainy_day;
      return shower_day;
    case "drizzle":
      return sunny_day;
    case "snow":
      return snowy_day;
    case "clear":
      return sunny_day;
    case "clouds":
      if(id ===801) return partly_cloudy_day;
      return cloudy_day;
    case "thunderstorm":
      return thunderstorm_day;
    default:
      return foggy_day;
  }
} 

const Weather = () => {
  return (
    <WeatherContext.Consumer>
      {({ airQuality, weatherData }) => {
        if (airQuality !== null && weatherData !== null) {
         let {
          feels_like,
          humidity,
          pressure,
          temp,
          visibility,
          weather,
          } = weatherData.current;
          const { description, icon, id, main } = weather[0]
          const backImg = setBackgroundImg(main, id)
          const imgSrc = `http://openweathermap.org/img/wn/${icon}@2x.png`;
          feels_like = Math.round(feels_like); 
          temp = Math.round(temp); 
          return (
            <StyledWeatherContainer img={backImg}>
              <StyledHeading>
                <StyledImgContainer>
                  <StyledImg src={imgSrc} alt="wind img" />
                </StyledImgContainer>
                <StyledDesc>
                  <span>Weather</span>
                  <span>What's the weather?</span>
                </StyledDesc>
              </StyledHeading>
              <div>
                <StyledDegree>
                  <span>{temp}°C</span>
                  <span>{feels_like}°C</span>
                </StyledDegree>
                <StyledCondition>{description}</StyledCondition>
              </div>
              <StyledStats>
                <div>
                  <span>pressure</span>
                  <span>{pressure}mb</span>
                </div>
                <div>
                  <span>visibility</span>
                  <span>{Number(visibility / 1000).toFixed(1)} km</span>
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
