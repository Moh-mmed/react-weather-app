import React,{useState, useEffect} from 'react';
import { NavLink} from "react-router-dom";
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
const SideBar = () => {
 const [activeLink, setActiveLink] = useState(false)
  const [currLink, setCurrLink] = useState(window.history)
  useEffect(() => {
    console.log(currLink);
  }, [activeLink]);
  

  return (
    <StyledSideBar>
      <StyledTodaysInfo>
        <StyledDate>
          <span>Sut 12 Feb</span>
          <span>Istanbul, Turkey</span>
        </StyledDate>
        <StyledTemp>
          <span>22°C</span>
        </StyledTemp>
      </StyledTodaysInfo>
      <StyledSunContainer>
        <StyledSunPath>
          <StyledPath day={true}>
            <StyledPathColoring variant={40} day={true} />
            {/* between 0 and 100*/}
          </StyledPath>
          <StyledSunIcon variant={40} />
        </StyledSunPath>
        <StyledStartNode variant={true} />
        <StyledMovingNode day={true} variant={40} />
        <StyledEndNode variant={false} />
        <StyledSunInfo>
          <div>
            <span>sunrise</span>
            <span>08:10 am</span>
          </div>
          <div>
            <span>sunset</span>
            <span>06:30 pm</span>
          </div>
        </StyledSunInfo>
      </StyledSunContainer>
      <StyledUIrays>
        <StyledSunImg src={sun} />
        <div>
          <div>
            <span>20 uvi</span>
            <span>moderate</span>
          </div>
          <div>moderate risk from UV rays</div>
        </div>
      </StyledUIrays>
      <StyledPredictionHeading>weather prediction</StyledPredictionHeading>
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
};

export default SideBar;
