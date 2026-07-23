import { createContext, useContext, useState } from "react";

export const TimeFormatContext = createContext({
  hourFormat: "24h",
  setHourFormat: () => {},
});

const HOUR_FORMAT_KEY = "weatherme:hourFormat";

const detectDefaultHourFormat = () => {
  try {
    const saved = localStorage.getItem(HOUR_FORMAT_KEY);
    if (saved === "12h" || saved === "24h") return saved;
  } catch (_) {}
  return "24h";
};

export const TimeFormatProvider = ({ children }) => {
  const [hourFormat, setHourFormatState] = useState(detectDefaultHourFormat);

  const setHourFormat = (format) => {
    if (format !== "12h" && format !== "24h") return;
    setHourFormatState(format);
    try {
      localStorage.setItem(HOUR_FORMAT_KEY, format);
    } catch (_) {}
  };

  return (
    <TimeFormatContext.Provider value={{ hourFormat, setHourFormat }}>
      {children}
    </TimeFormatContext.Provider>
  );
};

export const useTimeFormat = () => useContext(TimeFormatContext);
