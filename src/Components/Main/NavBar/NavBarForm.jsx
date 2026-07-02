import React, { useState, useRef, useEffect } from "react";
import Tooltip from "./Tooltip";
import { StyledSearchbar, StyledInput } from "./StyledNavComponents";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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
      <SearchIcon />
      <form onSubmit={handleFormSubmit}>
        <StyledInput
          ref={inputField}
          type="text"
          placeholder="Search a city or coordinates…"
          className="search-bar"
          onChange={(e) => setEnteredCity(e.target.value)}
        />
      </form>
      {cityNotFound && <Tooltip />}
    </StyledSearchbar>
  );
};

export default NavBarForm;
