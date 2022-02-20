import React, { useState, useRef, useEffect } from "react";
import search from "../../../imgs/search.png";
import Tooltip from "./Tooltip";
import {
  StyledSearchbar,
  StyledInput,
  StyledSearchImgContainer,
  StyledImg,
} from "./StyledNavComponents";
const NavBarForm = ({
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
  cityNotFound,
}) => {
  const [enteredCity, setEnteredCity] = useState(undefined);
  const inputField = useRef(null);
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (enteredCity !== undefined) {
      handleWeatherData(null);
      handleAirQuality(null);
      handleCurrCity(null);
      handleSearchCity(enteredCity);
      inputField.current.value = "";
      inputField.current.blur();
    }
  };

  useEffect(() => {
    inputField.current.focus();
  }, []);
  return (
    <StyledSearchbar>
      <form onSubmit={handleFormSubmit}>
        <StyledInput
          ref={inputField}
          type="text"
          placeholder="Search"
          className="search-bar"
          onChange={(e) => setEnteredCity(e.target.value)}
        />
      </form>
      <StyledSearchImgContainer>
        <StyledImg src={search} alt="search img" />
      </StyledSearchImgContainer>
      {cityNotFound && <Tooltip/>}
    </StyledSearchbar>
  );
};

export default NavBarForm;
