import React from 'react';
import {
  StyledSideBar,
  StyledTodaysInfo,
  StyledDate,
  StyledTemp,
} from "./StyledSideBar";
const SideBar = () => {
  return (
    <div>
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
    </div>
  );
};

export default SideBar;
