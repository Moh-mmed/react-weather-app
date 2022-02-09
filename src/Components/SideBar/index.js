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
            <StyledPathColoring variant={90} day={true} />
            {/* between 0 and 100*/}
          </StyledPath>
          <StyledSunIcon variant={90} />
        </StyledSunPath>
        <StyledStartNode variant={true} />
        <StyledMovingNode day={true} variant={90} />
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
    </StyledSideBar>
  );
};

export default SideBar;
