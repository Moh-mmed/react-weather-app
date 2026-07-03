import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Tooltip from "./Tooltip";
import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "../../../helpers/openWeather";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="shrink-0 pointer-events-none opacity-70">
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
    <div
      ref={containerRef}
      className="flex-1 max-w-[420px] min-w-[180px] relative flex items-center gap-2.5 bg-white/5 border border-panel-line rounded-full px-[18px] py-[11px] text-muted text-[14px]
                 tablet:max-w-none tablet:w-full tablet:min-w-0"
    >
      <SearchIcon />
      <form onSubmit={handleFormSubmit} className="flex flex-1">
        <input
          ref={inputField}
          type="text"
          placeholder="Search a city or coordinates…"
          className="search-bar bg-transparent border-none outline-none flex-1 text-primary text-[14px] font-sans w-full placeholder:text-muted"
          value={enteredCity}
          onChange={(e) => setEnteredCity(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>

      {cityNotFound && <Tooltip />}

      {isOpen && (
        <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-navy-panel border border-panel-line rounded-xl list-none p-[8px_0] m-0 z-10 shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-h-[250px] overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const formattedLocation = suggestion.state
                ? `${suggestion.state}, ${suggestion.country}`
                : suggestion.country;
              return (
                <li
                  key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                  className={clsx(
                    "px-[18px] py-2.5 cursor-pointer text-primary font-sans flex flex-col transition-colors duration-150 ease-out",
                    index === activeIndex ? "bg-white/5" : "bg-transparent",
                    "hover:bg-white/5"
                  )}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="text-[14px] font-medium">{suggestion.name}</span>
                  <span className="text-[12px] text-muted mt-0.5">{formattedLocation}</span>
                </li>
              );
            })
          ) : isLoading ? (
            <div className="px-[18px] py-3 text-muted font-sans text-[14px] text-center">Loading...</div>
          ) : (
            hasNoMatches && (
              <div className="px-[18px] py-3 text-muted font-sans text-[14px] text-center">No matches</div>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default NavBarForm;
