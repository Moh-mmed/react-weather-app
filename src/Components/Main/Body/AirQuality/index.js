import { useContext } from "react";
import WeatherContext from "../../../../contexts/WeatherContext";
import icon from "../../../../imgs/air_quality.png"
import backImg from "../../../../imgs/clear_air.jpg";
import {
  StyledAirQualityContainer,
  StyledHeading,
  StyledImgContainer,
  StyledImg,
  StyledDesc,
  StyledDegree,
  StyledCondition,
  StyledStats,
  StyledLevel,
  StyledLevelSpan,
  StyledProgressBarContainer,
  StyledProgressBar,
} from "./StyledAirQualityComponents";

const getWindDirection = (deg) => {
  deg = Number(deg)
  if(deg >= 348 || deg < 11 ) return "North"
  if(deg >= 11 && deg < 33 ) return "North Northeast";
  if(deg >= 33 && deg < 56 ) return "Northeast";
  if(deg >= 56 && deg < 78 ) return "East Northeast";
  if(deg >= 78 && deg < 101 ) return "East"
  if (deg >= 101 && deg < 123) return "East Southeast";
  if (deg >= 123 && deg < 146) return "Southeast";
  if (deg >= 146 && deg < 168) return "South Southeast";
  if (deg >= 168 && deg < 191) return "South";
  if(deg >= 191 && deg < 213 ) return "Southeast Southwest";
  if(deg >= 213 && deg < 236 ) return "Southwest";
  if(deg >= 236&& deg < 258 ) return "West Southwest";
  if(deg >= 258 && deg < 281 ) return "West"
  if(deg >= 281 && deg < 303 ) return "West Northwest"
  if (deg >= 303 && deg < 326) return "Northwest";
  if (deg >= 326 && deg < 348) return "North Northwest";
}

const AirQuality = () => {
  const { weatherData, airQuality } = useContext(WeatherContext);
 
  const {wind_deg} = weatherData.current
  const { components, main } = airQuality.list[0];
  let pm = Math.ceil(components.pm2_5);
  let aqi = 0;
  for (let key in components) {
    // Find greater air quality index
    if (key !== "co" && components[key] > aqi) {
        aqi = Math.ceil(components[key]);
    }
  }
  return (
    <StyledAirQualityContainer img={backImg} alt="today's air quality">
      <StyledHeading>
        <StyledImgContainer>
          <StyledImg src={icon} alt="wind img" />
        </StyledImgContainer>
        <StyledDesc>
          <span>air quality</span>
          <span>main pollution: PM {pm}</span>
        </StyledDesc>
      </StyledHeading>
      <div>
        <StyledDegree>
          <span>{aqi}</span>
          <span>aqi</span>
        </StyledDegree>
        <StyledCondition>
          {getWindDirection(wind_deg)}
        </StyledCondition>
      </div>
      <StyledStats>
        <StyledLevel>
          <StyledLevelSpan variant={main.aqi === 1 && true}>
            good
          </StyledLevelSpan>
          <StyledLevelSpan variant={main.aqi === 2 && true}>
            fair
          </StyledLevelSpan>
          <StyledLevelSpan variant={main.aqi === 3 && true}>
            standard
          </StyledLevelSpan>
          <StyledLevelSpan variant={main.aqi === 4 && true}>
            poor
          </StyledLevelSpan>
          <StyledLevelSpan variant={main.aqi === 5 && true}>
            hazardous
          </StyledLevelSpan>
        </StyledLevel>
        <StyledProgressBarContainer>
          <StyledProgressBar variant={main.aqi} />
        </StyledProgressBarContainer>
      </StyledStats>
    </StyledAirQualityContainer>
  );
};

export default AirQuality;
