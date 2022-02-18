import React from 'react';
import logo from '../../../imgs/weatherme.png'
import {
  NavContainer,
  StyledLogo,
  StyledImage,
} from "./StyledNavComponents";
import NavBarForm from './NavBarForm';

const Nav = ({
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity
}) => {
  return (
    <NavContainer>
      <StyledLogo>
        <StyledImage src={logo} alt="Weather logo" />
      </StyledLogo>
      <NavBarForm
        handleSearchCity={handleSearchCity}
        handleWeatherData={handleWeatherData}
        handleAirQuality={handleAirQuality}
        handleCurrCity={handleCurrCity}
      />
    </NavContainer>
  );
};

export default React.memo(Nav);
