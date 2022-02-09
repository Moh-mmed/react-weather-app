import React from 'react';
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
} from "./StyledSidebarComponents";
const SideBar = () => {
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
        <div></div>
        <div>
          <div>
            <span>20 uvi</span>
            <span>moderate</span>
          </div>
          <div>moderate risk from UV rays</div>
        </div>
      </StyledUIrays>
    </StyledSideBar>
  );
};

export default SideBar;
