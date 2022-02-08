import React from 'react';
import {
  StyledSideBar,
  StyledTodaysInfo,
  StyledDate,
  StyledTemp,
} from "./StyledSideBar";
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
      </StyledSideBar>
  );
};

export default SideBar;
