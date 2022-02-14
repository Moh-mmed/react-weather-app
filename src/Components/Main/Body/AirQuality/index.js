import React from "react";
import WeatherContext from "../../../../WeatherContext";
import img from "../../../../imgs/wind.png"
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

const AirQuality = () => {
  return (
    <WeatherContext.Consumer>
      {({airQuality,weather}) => {
        if (airQuality !== null && weather !== null) {
          const { components, main } = airQuality.list[0];
          const { wind_deg } = weather.current;
          let pm = Math.ceil(components.pm2_5);
          let aqi = main.aqi;
          console.log(airQuality);
          return (
            <StyledAirQualityContainer>
              <StyledHeading>
                <StyledImgContainer>
                  <StyledImg src={img} alt="wind img" />
                </StyledImgContainer>
                <StyledDesc>
                  <span>air quality</span>
                  <span>main pollution: PM {pm}</span>
                </StyledDesc>
              </StyledHeading>
              <div>
                <StyledDegree>
                  <span>{wind_deg}</span>
                  <span>aqi {aqi}</span>
                </StyledDegree>
                <StyledCondition>west wind</StyledCondition>
              </div>
              <StyledStats>
                <StyledLevel>
                  <StyledLevelSpan variant={aqi === 1 && true}>
                    good
                  </StyledLevelSpan>
                  <StyledLevelSpan variant={aqi === 2 && true}>
                    fair
                  </StyledLevelSpan>
                  <StyledLevelSpan variant={aqi === 3 && true}>
                    standard
                  </StyledLevelSpan>
                  <StyledLevelSpan variant={aqi === 4 && true}>
                    poor
                  </StyledLevelSpan>
                  <StyledLevelSpan variant={aqi === 5 && true}>
                    hazardous
                  </StyledLevelSpan>
                </StyledLevel>
                <StyledProgressBarContainer>
                  <StyledProgressBar variant={aqi} />
                </StyledProgressBarContainer>
              </StyledStats>
            </StyledAirQualityContainer>
          );
        }
      }}
    </WeatherContext.Consumer>
  );
};

export default AirQuality;
