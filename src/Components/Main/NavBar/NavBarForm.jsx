import React, { useState, useRef, useEffect } from "react";
import Tooltip from "./Tooltip";
import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "../../../helpers/openWeather";
import {
  StyledSearchbar,
  StyledInput,
  StyledDropdown,
  StyledDropdownItem,
  StyledDropdownText,
  StyledDropdownSubtext,
  StyledNoMatches,
} from "./StyledNavComponents";

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
  const [enteredCity, setEnteredCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasNoMatches, setHasNoMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputField = useRef(null);
  const containerRef = useRef(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!enteredCity || enteredCity.trim().length < 2) {
      setSuggestions([]);
      setHasNoMatches(false);
      setIsOpen(false);
      return;
    }

    // Exclude coordinates pattern: e.g. "41.01, 28.66"
    const isCoords = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(enteredCity.trim());
    if (isCoords) {
      setSuggestions([]);
      setHasNoMatches(false);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (!OPEN_WEATHER_API_KEY) return;
      setIsLoading(true);
      setIsOpen(true);
      setHasNoMatches(false);
      try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          enteredCity.trim()
        )}&limit=5&appid=${OPEN_WEATHER_API_KEY}`;
        const response = await axios.get(url, {
          headers: { Accept: "application/json" },
        });

        if (response.data && response.data.length > 0) {
          setSuggestions(response.data);
          setHasNoMatches(false);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setHasNoMatches(true);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Geocoding suggestions error:", err);
        // Fail silently
        setSuggestions([]);
        setHasNoMatches(false);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [enteredCity]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectSuggestion = (suggestion) => {
    const formattedName = suggestion.state
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;

    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);

    handleWeatherData(null);
    handleAirQuality(null);
    handleCurrCity(null);
    handleSearchCity(formattedName);
    setEnteredCity("");
    if (inputField.current) {
      inputField.current.blur();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (enteredCity.trim() !== "") {
      handleWeatherData(null);
      handleAirQuality(null);
      handleCurrCity(null);
      handleSearchCity(enteredCity);
      setEnteredCity("");
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      if (inputField.current) {
        inputField.current.blur();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    }
  };

  useEffect(() => {
    if (inputField.current) {
      inputField.current.focus();
    }
  }, []);

  return (
    <StyledSearchbar ref={containerRef}>
      <SearchIcon />
      <form onSubmit={handleFormSubmit}>
        <StyledInput
          ref={inputField}
          type="text"
          placeholder="Search a city or coordinates…"
          className="search-bar"
          value={enteredCity}
          onChange={(e) => setEnteredCity(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>
      {cityNotFound && <Tooltip />}

      {isOpen && (
        <StyledDropdown>
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const formattedLocation = suggestion.state
                ? `${suggestion.state}, ${suggestion.country}`
                : suggestion.country;
              return (
                <StyledDropdownItem
                  key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                  highlighted={index === activeIndex}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <StyledDropdownText>{suggestion.name}</StyledDropdownText>
                  <StyledDropdownSubtext>{formattedLocation}</StyledDropdownSubtext>
                </StyledDropdownItem>
              );
            })
          ) : isLoading ? (
            <StyledNoMatches>Loading...</StyledNoMatches>
          ) : (
            hasNoMatches && <StyledNoMatches>No matches</StyledNoMatches>
          )}
        </StyledDropdown>
      )}
    </StyledSearchbar>
  );
};

export default NavBarForm;
