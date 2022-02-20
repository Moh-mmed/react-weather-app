import React from 'react';
import logo from '../../../imgs/weatherme.png'
import {
  NavContainer,
  StyledLogo,
  StyledImage,
} from "./StyledNavComponents";
import NavBarForm from './NavBarForm';
import Tooltip from "./Tooltip";

const Nav = ({
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
  cityNotFound
}) => {
  return (
    <NavContainer>
      <StyledLogo>
        <StyledImage src={logo} alt="Weather logo" />
      </StyledLogo>
      <NavBarForm
        cityNotFound={cityNotFound}
        handleSearchCity={handleSearchCity}
        handleWeatherData={handleWeatherData}
        handleAirQuality={handleAirQuality}
        handleCurrCity={handleCurrCity}
      />
    </NavContainer>
  );
};

export default React.memo(Nav);
