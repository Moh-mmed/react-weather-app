export const breakpoints = {
  mobile: "480px",
  tablet: "768px",
  desktop: "980px",
};

export const theme = {
  bg0: "#0A1826",
  bg1: "#0F2338",
  panel: "#13273D",
  panelLine: "rgba(255,255,255,0.07)",
  textHi: "#EEF3F7",
  textLo: "#8CA1B4",
  sun: "#F4A93B",
  sky: "#4FA3D9",
  coral: "#E2694A",
  good: "#5FB88A",
  fonts: {
    display: "'Fraunces', serif",
    body: "'Inter', sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },
};

// Legacy aliases kept for any remaining imports
export const colors = {
  mainColor: theme.sky,
  lightMainColor: "rgba(79,163,217,0.45)",
  FontDarkBlue: theme.bg0,
  FontBlack: theme.textHi,
  FirstDarkGray: theme.textLo,
  SecondDarkGray: theme.textLo,
  firstLightGray: theme.panel,
  secondLightGray: theme.panelLine,
  lightGreen: theme.good,
};
