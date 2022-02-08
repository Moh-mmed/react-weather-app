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
  StyledNodePoint,
  StyledMovingNode,
  StyledSunInfo,
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
          <StyledPath>
            <StyledSunIcon />
          </StyledPath>
          <StyledNodePoint />
          <StyledMovingNode />
          <StyledNodePoint />
        </StyledSunPath>
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
