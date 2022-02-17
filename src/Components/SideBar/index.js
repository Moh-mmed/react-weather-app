import React, { useState, useEffect } from 'react';
import moment from 'moment'
import { NavLink} from "react-router-dom";
import WeatherContext from "../../WeatherContext";
import calendar from '../../imgs/calendar.png'
import sun from "../../imgs/sun.png";
import cloudy from "../../imgs/all-cloudy.png";
import {
  StyledSideBar,
  StyledTodaysInfo,
  StyledDate,
  StyledTemp,
  StyledSunContainer,
  StyledSunPath,
  StyledSunIcon,
  StyledPath,
  StyledStartNode,
  StyledEndNode,
  StyledMovingNode,
  StyledSunInfo,
  StyledPathColoring,
  StyledUIrays,
  StyledPredictionHeading,
  StyledFollowingDays,
  PredictionDay,
  StyledSunImg,
  StyledFollowingFiveDays,
  StyledCalendarIcon,
  StyledNextFiveDaysLink,
} from "./StyledSidebarComponents";
const getUVI = (UVI) => {
  if(UVI <=2) return "low"
  else if(UVI <=5) return "moderate"
  else if(UVI <=7) return "high"
  else if(UVI <=10) return "very high"
  else return "extreme"
}
const getTiming = (sunrise, sunset, time, timezone) => {
  let today = moment.unix(time).format("ddd DD MMM");
  let Sunrise = moment(sunrise * 1000)
    .utcOffset(timezone / 60)
    .format("LT");
  let Sunset = moment(sunset * 1000)
    .utcOffset(timezone / 60)
    .format("LT");
  let clock = moment(time * 1000)
    .utcOffset(timezone / 60)
    .format("LT");
  if (time >= sunrise && time < sunset) {
    let day = true;
    let dayDuration = (sunset - sunrise) / 60;
    let timeElapsed = (time - sunrise) / 60;
    let widthUnit = 100 / dayDuration;
    let width = widthUnit * timeElapsed;

    return { day, width, today, Sunrise, Sunset, clock };
  }
  return { day: false, width: 0, today, Sunrise, Sunset, clock };
};
const SideBar = () => {
  const [activeLink, setActiveLink] = useState(false)
   
  // const [currLink, setCurrLink] = useState(window.history)
  // useEffect(() => {
  //   console.log(currLink);
  // }, [activeLink]);
  

  return (
    <WeatherContext.Consumer>
      {({airQuality, weatherData, currCity }) => {
        if (weatherData !== null && airQuality !== null) {
         
          const { current, timezone_offset } = weatherData;
          const { dt, temp, uvi, sunrise, sunset } = current;
          const { city, country } = currCity;
          let UVI = Math.round(uvi);
          
          const { day, width, today, Sunrise, Sunset, clock } = getTiming(
            sunrise,
            sunset,
            dt,
            timezone_offset
          );
          
          return (
            <StyledSideBar>
              <StyledTodaysInfo>
                <StyledDate>
                  <span>{today}</span>
                  <div>
                    <span>
                      {city}, {country}
                    </span>
                    <span>{clock}</span>
                  </div>
                </StyledDate>
                <StyledTemp>
                  <span>{Math.round(temp)}°C</span>
                </StyledTemp>
              </StyledTodaysInfo>
              <StyledSunContainer>
                <StyledSunPath>
                  <StyledPath day={day}>
                    <StyledPathColoring width={width} day={day} />
                  </StyledPath>
                  <StyledSunIcon width={width} />
                </StyledSunPath>
                <StyledStartNode day={true} />
                <StyledMovingNode day={day} width={width} />
                <StyledEndNode day={day} />
                <StyledSunInfo>
                  <div>
                    <span>sunrise</span>
                    <span>{Sunrise}</span>
                  </div>
                  <div>
                    <span>sunset</span>
                    <span>{Sunset}</span>
                  </div>
                </StyledSunInfo>
              </StyledSunContainer>
              <StyledUIrays>
                <StyledSunImg src={sun} />
                <div>
                  <div>
                    <span>{UVI} uvi</span>
                    <span>{getUVI(UVI)}</span>
                  </div>
                  <div>{getUVI(UVI)} risk from UV rays</div>
                </div>
              </StyledUIrays>
              <StyledPredictionHeading>
                weather prediction
              </StyledPredictionHeading>
              <StyledFollowingDays>
                <PredictionDay>
                  <StyledSunImg src={cloudy} />
                  <div>
                    <div>november 10</div>
                    <div>
                      <span>cloudy</span>
                      <div>
                        <span>26°</span>
                        <span>/</span>
                        <span>19°</span>
                      </div>
                    </div>
                  </div>
                </PredictionDay>
                <PredictionDay>
                  <StyledSunImg src={sun} />
                  <div>
                    <div>november 11</div>
                    <div>
                      <span>bright</span>
                      <div>
                        <span>26°</span>
                        <span>/</span>
                        <span>20°</span>
                      </div>
                    </div>
                  </div>
                </PredictionDay>
              </StyledFollowingDays>
              <StyledFollowingFiveDays>
                {activeLink ? (
                  <NavLink to="todays-temperatures">
                    <StyledNextFiveDaysLink
                      onClick={() => setActiveLink(!activeLink)}
                      variant={activeLink}
                    >
                      <StyledCalendarIcon src={calendar} />
                      <span>today's temperatures</span>
                    </StyledNextFiveDaysLink>
                  </NavLink>
                ) : (
                  <NavLink to="next-five-days">
                    <StyledNextFiveDaysLink
                      onClick={() => setActiveLink(!activeLink)}
                      variant={activeLink}
                    >
                      <StyledCalendarIcon src={calendar} />
                      <span>next 5 days</span>
                    </StyledNextFiveDaysLink>
                  </NavLink>
                )}
              </StyledFollowingFiveDays>
            </StyledSideBar>
          );
        }
      }}
    </WeatherContext.Consumer>
  );
};

export default SideBar;
