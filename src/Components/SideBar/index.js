import {  useContext } from 'react';
import WeatherContext from "../../contexts/WeatherContext";
import calendar from '../../imgs/calendar.png'
import sun from "../../imgs/sun.png";
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
  StyledFollowingFiveDays,
  StyledCalendarIcon,
  StyledButton,
} from "./StyledSidebarComponents";
import PredictionDay from './PredictionDay';
import getUVI from "../../helpers/getUVI"
import getTiming from "../../helpers/getTiming";
const SideBar = ({ handleNextFiveDaysDisplay }) => {
  const { weatherData, currCity, nextFiveDays } = useContext(WeatherContext);
  const { current, timezone_offset, daily } = weatherData;
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
          <div>
            <span>{today}</span>
            <span>{clock}</span>
          </div>
          <span>
            {city}, {country}
          </span>
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
        <img src={sun} alt="sun" style={{ width: "35px" }} />
        <div>
          <div>
            <span>{UVI} uvi</span>
            <span>{getUVI(UVI)}</span>
          </div>
          <div>{getUVI(UVI)} risk from UV rays</div>
        </div>
      </StyledUIrays>
      <StyledPredictionHeading>weather prediction</StyledPredictionHeading>
      <StyledFollowingDays>
        <PredictionDay data={daily[1]} timezoneOffset={timezone_offset} />
        <PredictionDay data={daily[2]} timezoneOffset={timezone_offset} />
      </StyledFollowingDays>
      <StyledFollowingFiveDays>
        <StyledButton
          onClick={() => handleNextFiveDaysDisplay(!nextFiveDays)}
          variant={nextFiveDays}
        >
          <StyledCalendarIcon src={calendar} />
          <span>{nextFiveDays ? "today's temperatures" : "next 5 days"}</span>
        </StyledButton>
      </StyledFollowingFiveDays>
    </StyledSideBar>
  );
};

export default SideBar;
