import {useContext} from 'react';
import WeatherContext from "../../../../WeatherContext";
import { setBackgroundImg } from './Images';
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
const { weatherData } = useContext(WeatherContext);
console.log("Weather")
const {
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
        <span>{Math.round(temp)}°C</span>
        <span>{Math.round(feels_like)}°C</span>
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
        
};

export default Weather;
