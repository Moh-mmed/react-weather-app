import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

// Non-blocking geo-error toast.
// Always present in the DOM (position:absolute, no layout impact), visibility
// toggled via opacity + visibility so mount/unmount never causes reflow.
// IMPORTANT: className must be a static string — Tailwind JIT does not scan
// dynamically constructed arrays or template literals for class names.
const GeoErrorToast = ({ isVisible, message }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    style={{
      // Fade in 150 ms; fade out 200 ms with a visibility delay so it's
      // fully transparent before being hidden from pointer events.
      transition: isVisible
        ? 'opacity 0.15s ease'
        : 'opacity 0.2s ease, visibility 0s linear 0.2s',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
    }}
    className="absolute top-[calc(100%+6px)] right-0 z-[200] whitespace-nowrap
               bg-navy-panel border border-panel-line rounded-xl
               px-3 py-2 text-[0.72rem] font-medium text-primary
               shadow-[0_8px_32px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.35)]
               after:content-[''] after:absolute after:-top-[7px] after:right-[9px]
               after:border-l-[7px] after:border-l-transparent
               after:border-r-[7px] after:border-r-transparent
               after:border-b-[7px] after:border-b-panel-line
               before:content-[''] before:absolute before:-top-[5px] before:right-[10px]
               before:border-l-[6px] before:border-l-transparent
               before:border-r-[6px] before:border-r-transparent
               before:border-b-[6px] before:border-b-navy-panel before:z-10"
  >
    <span className="flex items-center gap-2">
      {/* Coral dot — communicates "error" without relying on bg color */}
      <span className="w-[7px] h-[7px] rounded-full bg-accent-coral shrink-0" aria-hidden="true" />
      {message}
    </span>
  </div>
);

// Small circular spinner for the geo-button loading state.
// Uses motion-safe: so the animation is skipped under prefers-reduced-motion
// (the icon simply stays visible at reduced opacity as a static cue).
const SmallSpinner = () => (
  <svg
    className="motion-safe:animate-spin h-[15px] w-[15px] text-accent-sky"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3.5"
    />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const NavBarForm = ({
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
  handleGeoCoords,
  cityNotFound,
  isUpdatingLocation,
  handleAddSavedLocation,
  savedLocations = [],
}) => {
  const { t } = useTranslation();
  const [enteredCity, setEnteredCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasNoMatches, setHasNoMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [geoState, setGeoState] = useState("idle"); // 'idle' | 'loading' | 'error'
  // Separate boolean for the toast visibility so we can fade it out before
  // removing it (geoState transitions back to 'idle' at the end of the timer).
  const [geoErrorVisible, setGeoErrorVisible] = useState(false);
  const geoToastTimerRef = useRef(null);

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

  // Shared helper: show the geo-error toast for 3 s then fade it back out.
  const showGeoError = () => {
    // Clear any in-flight dismiss timer before starting a new cycle.
    if (geoToastTimerRef.current) clearTimeout(geoToastTimerRef.current);
    setGeoState("error");
    setGeoErrorVisible(true);
    geoToastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        // Fade out first (CSS transition handles 200 ms), then reset state.
        setGeoErrorVisible(false);
        setTimeout(() => {
          if (isMountedRef.current) setGeoState("idle");
        }, 220);
      }
    }, 3000);
  };

  // Request geolocation and feed coordinates directly into the weather-fetch flow.
  // Independent of the search input — typing in the search bar has no effect here.
  const handleGeoClick = () => {
    if (geoState === "loading") return;
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMountedRef.current) return;
        const lat = Number(position.coords.latitude);
        const lon = Number(position.coords.longitude);
        try {
          // Trigger parent state updates that fetch weather in background
          await handleGeoCoords({ lat, lon });
          if (isMountedRef.current) {
            setGeoState("idle");
          }
        } catch (err) {
          console.log("error set at: handleGeoClick catch block", err);
          if (isMountedRef.current) showGeoError();
        }
      },
      (geoErr) => {
        if (!isMountedRef.current) return;
        console.log("error set at: geolocation error callback", geoErr);
        // Denied, timed out, or unavailable — show toast for 3 s then fade out
        showGeoError();
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
      className="flex-1 min-w-[220px] max-w-[420px] relative flex items-center gap-2.5 bg-white/5 border border-panel-line rounded-full px-[18px] py-[11px] text-muted text-[14px]"
    >
      <SearchIcon />
      <form onSubmit={handleFormSubmit} className="flex flex-1">
        <input
          ref={inputField}
          type="text"
          placeholder={t("header.searchPlaceholder")}
          className="search-bar bg-transparent border-none outline-none flex-1 text-primary text-[14px] font-sans w-full placeholder:text-muted"
          value={enteredCity}
          onChange={(e) => setEnteredCity(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>

      {/* Geolocation button — fixed 24×24 px so icon swap never shifts layout */}
      <button
        type="button"
        id="geo-location-btn"
        onClick={handleGeoClick}
        disabled={geoState === "loading" || isUpdatingLocation}
        title={t("header.geoBtnTitle")}
        aria-label={t("header.geoBtnTitle")}
        className={clsx(
          // w-6 h-6 = 24×24 px fixed — CrosshairIcon (15px) and SmallSpinner (15px)
          // are both smaller than the button, so swapping them causes no resize.
          "relative shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-opacity duration-200",
          geoState === "idle" && !isUpdatingLocation &&
            "text-accent-sky opacity-60 hover:opacity-100 hover:bg-white/10 cursor-pointer",
          (geoState === "loading" || isUpdatingLocation) && "text-accent-sky opacity-40 cursor-not-allowed",
          geoState === "error" && "text-accent-coral opacity-80 cursor-pointer"
        )}
      >
        {geoState === "loading" || isUpdatingLocation ? (
          <SmallSpinner />
        ) : (
          <CrosshairIcon />
        )}
      </button>

      {cityNotFound && <Tooltip />}
      {/* Toast is always in the DOM; visibility toggled via opacity transition */}
      <GeoErrorToast isVisible={geoErrorVisible} message={t("header.geoError")} />

      {isOpen && (
        <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-navy-panel border border-panel-line rounded-xl list-none p-[8px_0] m-0 z-10 shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-h-[250px] overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const formattedLocation = suggestion.state
                ? `${suggestion.state}, ${suggestion.country}`
                : suggestion.country;
              const isSaved = savedLocations.some(
                (loc) =>
                  Math.abs(loc.lat - suggestion.lat) < 0.01 &&
                  Math.abs(loc.lon - suggestion.lon) < 0.01
              );
              return (
                <li
                  key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                  className={clsx(
                    "px-[18px] py-2.5 cursor-pointer text-primary font-sans flex items-center justify-between transition-colors duration-150 ease-out",
                    index === activeIndex ? "bg-white/5" : "bg-transparent",
                    "hover:bg-white/5"
                  )}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] font-medium">{suggestion.name}</span>
                    <span className="text-[12px] text-muted mt-0.5">{formattedLocation}</span>
                  </div>

                  {handleAddSavedLocation && (
                    <button
                      type="button"
                      title={isSaved ? t("header.saved") : t("header.saveLocation")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSaved) {
                          handleAddSavedLocation({
                            city: suggestion.name,
                            country: suggestion.country,
                            lat: Number(suggestion.lat),
                            lon: Number(suggestion.lon),
                          });
                        }
                      }}
                      className={clsx(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ml-2 shrink-0",
                        isSaved
                          ? "text-accent-sky opacity-80 cursor-default"
                          : "bg-white/5 border border-white/10 hover:bg-white/20 text-primary cursor-pointer"
                      )}
                    >
                      {isSaved ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </button>
                  )}
                </li>
              );
            })
          ) : isLoading ? (
            <div className="px-[18px] py-3 text-muted font-sans text-[14px] text-center">{t("header.loading")}</div>
          ) : (
            hasNoMatches && (
              <div className="px-[18px] py-3 text-muted font-sans text-[14px] text-center">{t("header.noMatches")}</div>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default NavBarForm;
