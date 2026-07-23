import { createContext, useContext, useState, useEffect } from "react";

export const UnitContext = createContext({
  unitSystem: "metric", // "metric" | "imperial"
  setUnitSystem: () => {},
  toggleUnitSystem: () => {},
  convertTemp: (c) => c,
  convertWind: (ms) => ({ value: 0, unitKey: "stats.unitKmH" }),
  convertVisibility: (meters) => ({ value: 0, unitKey: "stats.unitKm" }),
  convertPressure: (hpa) => ({ value: 0, unitKey: "stats.unitHpa" }),
});

const UNIT_KEY = "weatherme:unitSystem";

const detectDefaultUnitSystem = () => {
  try {
    const saved = localStorage.getItem(UNIT_KEY);
    if (saved === "metric" || saved === "imperial") return saved;

    const isUSLocale = navigator.languages
      ? navigator.languages.some((lang) => lang.endsWith("-US") || lang === "en-US")
      : navigator.language?.endsWith("-US") || navigator.language === "en-US";

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isUSTimezone =
      tz &&
      (tz.startsWith("America/New_York") ||
        tz.startsWith("America/Chicago") ||
        tz.startsWith("America/Denver") ||
        tz.startsWith("America/Los_Angeles") ||
        tz.startsWith("America/Anchorage") ||
        tz.startsWith("America/Adak") ||
        tz.startsWith("Pacific/Honolulu"));

    if (isUSLocale || isUSTimezone) {
      return "imperial";
    }
  } catch (_) {}
  return "metric";
};

export const UnitProvider = ({ children }) => {
  const [unitSystem, setUnitSystemState] = useState(detectDefaultUnitSystem);

  const setUnitSystem = (system) => {
    setUnitSystemState(system);
    try {
      localStorage.setItem(UNIT_KEY, system);
    } catch (_) {}
  };

  const toggleUnitSystem = () => {
    setUnitSystem(unitSystem === "metric" ? "imperial" : "metric");
  };

  const convertTemp = (tempC) => {
    if (!Number.isFinite(tempC)) return "--";
    if (unitSystem === "imperial") {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  const convertWind = (speedMs) => {
    if (!Number.isFinite(speedMs)) return { value: "--", unitKey: unitSystem === "imperial" ? "stats.unitMph" : "stats.unitKmH" };
    if (unitSystem === "imperial") {
      return {
        value: Math.round(speedMs * 2.23694),
        unitKey: "stats.unitMph",
      };
    }
    return {
      value: Math.round(speedMs * 3.6),
      unitKey: "stats.unitKmH",
    };
  };

  const convertVisibility = (meters) => {
    if (!Number.isFinite(meters)) return { value: "--", unitKey: unitSystem === "imperial" ? "stats.unitMi" : "stats.unitKm" };
    const km = meters / 1000;
    if (unitSystem === "imperial") {
      const mi = (km * 0.621371).toFixed(1);
      return {
        value: mi,
        unitKey: "stats.unitMi",
      };
    }
    return {
      value: km.toFixed(1),
      unitKey: "stats.unitKm",
    };
  };

  const convertPressure = (hpa) => {
    if (!Number.isFinite(hpa)) return { value: "--", unitKey: unitSystem === "imperial" ? "stats.unitInHg" : "stats.unitHpa" };
    if (unitSystem === "imperial") {
      const inHg = (hpa * 0.02953).toFixed(2);
      return {
        value: inHg,
        unitKey: "stats.unitInHg",
      };
    }
    return {
      value: Math.round(hpa),
      unitKey: "stats.unitHpa",
    };
  };

  return (
    <UnitContext.Provider
      value={{
        unitSystem,
        setUnitSystem,
        toggleUnitSystem,
        convertTemp,
        convertWind,
        convertVisibility,
        convertPressure,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => useContext(UnitContext);
