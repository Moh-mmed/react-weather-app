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

// Crosshair / GPS icon — stroke-based, matches SearchIcon style above.
// When `spinning` is true (geolocation pending) animate-spin is applied.
const CrosshairIcon = ({ spinning = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    width="15"
    height="15"
    className={clsx("shrink-0 pointer-events-none", spinning && "animate-spin")}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="2" x2="12" y2="7" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <line x1="2" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="22" y2="12" />
  </svg>
);

// Non-blocking error toast — reuses the animate-displayTooltip keyframe
// already defined in tailwind.config.js (same pattern as Tooltip.jsx).
const GeoErrorToast = () => (
  <div
    className="absolute opacity-0 top-[calc(100%+8px)] right-0 bg-accent-coral/92 rounded-[15px] px-[13px] py-3 text-[0.7rem] text-white animate-displayTooltip z-[2] whitespace-nowrap
               after:content-[''] after:absolute after:-top-1.5 after:right-[10px] after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-accent-coral/92"
  >
    Couldn't get your location
  </div>
);

const NavBarForm = ({
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
  handleGeoCoords,
  cityNotFound,
}) => {
  const [enteredCity, setEnteredCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasNoMatches, setHasNoMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [geoState, setGeoState] = useState("idle"); // 'idle' | 'loading' | 'error'

  const inputField = useRef(null);
  const containerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Track mount status so geolocation/timers don't run state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

    let cancelled = false;

    const delayDebounceFn = setTimeout(async () => {
      if (!OPEN_WEATHER_API_KEY || cancelled) return;
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

        if (cancelled) return;

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
        if (cancelled) return;
        console.error("Geocoding suggestions error:", err);
        setSuggestions([]);
        setHasNoMatches(false);
        setIsOpen(false);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(delayDebounceFn);
    };
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

    // Update local state first before unmount is triggered
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setEnteredCity("");

    if (inputField.current) {
      inputField.current.blur();
    }

    // Trigger parent updates which may unmount this component
    handleWeatherData(null);
    handleAirQuality(null);
    handleCurrCity(null);
    handleSearchCity(formattedName);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (enteredCity.trim() !== "") {
      const cityToSearch = enteredCity;

      // Update local state first before unmount is triggered
      setEnteredCity("");
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);

      if (inputField.current) {
        inputField.current.blur();
      }

      // Trigger parent updates which may unmount this component
      handleWeatherData(null);
      handleAirQuality(null);
      handleCurrCity(null);
      handleSearchCity(cityToSearch);
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

  // Request geolocation and feed coordinates directly into the weather-fetch flow.
  // Independent of the search input — typing in the search bar has no effect here.
  const handleGeoClick = () => {
    if (geoState === "loading") return;
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        const lat = Number(position.coords.latitude);
        const lon = Number(position.coords.longitude);
        
        // Reset display state local properties before parent triggers unmount
        setGeoState("idle");

        // Trigger parent state updates that unmount this component
        handleWeatherData(null);
        handleAirQuality(null);
        handleCurrCity(null);
        handleGeoCoords({ lat, lon });
      },
      () => {
        if (!isMountedRef.current) return;
        // Denied, timed out, or unavailable — show toast for 3 s then auto-reset
        setGeoState("error");
        setTimeout(() => {
          if (isMountedRef.current) {
            setGeoState("idle");
          }
        }, 3000);
      },
      { timeout: 9000, maximumAge: 1000 * 60 * 5 }
    );
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

      {/* Geolocation button — trailing edge inside the pill, independent of search */}
      <button
        type="button"
        id="geo-location-btn"
        onClick={handleGeoClick}
        disabled={geoState === "loading"}
        title="Use my current location"
        aria-label="Use my current location"
        className={clsx(
          "shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200",
          geoState === "idle" &&
            "text-accent-sky opacity-60 hover:opacity-100 hover:bg-white/10 cursor-pointer",
          geoState === "loading" && "text-accent-sky opacity-40 cursor-not-allowed",
          geoState === "error" && "text-accent-coral opacity-80 cursor-pointer"
        )}
      >
        <CrosshairIcon spinning={geoState === "loading"} />
      </button>

      {cityNotFound && <Tooltip />}
      {geoState === "error" && <GeoErrorToast />}

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
