import React, { createContext, useContext, useState, useEffect } from "react";

const THEME_KEY = "weatherme:theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") {
        return saved;
      }
      const legacy = localStorage.getItem("weatherme:themeMode");
      if (legacy === "night") return "dark";
      if (legacy === "day") return "light";

      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    } catch (_) {}
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.dataset.weatherTheme = "night";
    } else {
      root.classList.remove("dark");
      root.dataset.weatherTheme = "day";
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem("weatherme:themeMode", theme === "dark" ? "night" : "day");
    } catch (_) {}
  }, [theme]);

  // Listen for OS-level preference changes when user hasn't saved a manual choice
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      try {
        const saved = localStorage.getItem(THEME_KEY);
        if (!saved) {
          setThemeState(e.matches ? "dark" : "light");
        }
      } catch (_) {}
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme) => {
    if (newTheme === "dark" || newTheme === "light") {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
