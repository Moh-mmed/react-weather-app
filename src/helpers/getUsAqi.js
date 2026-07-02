const PM25_BREAKPOINTS = [
  [0, 12.0, 0, 50],
  [12.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 150.4, 151, 200],
  [150.5, 250.4, 201, 300],
  [250.5, 500.4, 301, 500],
];

const PM10_BREAKPOINTS = [
  [0, 54, 0, 50],
  [55, 154, 51, 100],
  [155, 254, 101, 150],
  [255, 354, 151, 200],
  [355, 424, 201, 300],
  [425, 604, 301, 500],
];

const NO2_BREAKPOINTS = [
  [0, 53, 0, 50],
  [54, 100, 51, 100],
  [101, 360, 101, 150],
  [361, 649, 151, 200],
  [650, 1249, 201, 300],
  [1250, 2049, 301, 500],
];

const O3_BREAKPOINTS = [
  [0, 54, 0, 50],
  [55, 70, 51, 100],
  [71, 85, 101, 150],
  [86, 105, 151, 200],
  [106, 200, 201, 300],
];

const SO2_BREAKPOINTS = [
  [0, 35, 0, 50],
  [36, 75, 51, 100],
  [76, 185, 101, 150],
  [186, 304, 151, 200],
  [305, 604, 201, 300],
  [605, 1004, 301, 500],
];

const POLLUTANT_CONFIG = [
  { key: "pm2_5", breakpoints: PM25_BREAKPOINTS, label: "PM2.5" },
  { key: "pm10", breakpoints: PM10_BREAKPOINTS, label: "PM10" },
  { key: "no2", breakpoints: NO2_BREAKPOINTS, label: "NO₂" },
  { key: "o3", breakpoints: O3_BREAKPOINTS, label: "O₃" },
  { key: "so2", breakpoints: SO2_BREAKPOINTS, label: "SO₂" },
];

const calcSubIndex = (concentration, breakpoints) => {
  const value = Number(concentration);
  if (!Number.isFinite(value) || value < 0) return null;

  for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
    if (value >= cLow && value <= cHigh) {
      return Math.round(
        ((iHigh - iLow) / (cHigh - cLow)) * (value - cLow) + iLow
      );
    }
  }

  return null;
};

export const getUsAqiLabel = (aqi) => {
  if (!Number.isFinite(aqi)) return "Unknown";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export const getUsAqiShortLabel = (aqi) => {
  if (!Number.isFinite(aqi)) return "Unknown";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "USG";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export const getUsAqiFromComponents = (components = {}) => {
  let maxAqi = 0;
  let mainPollutant = "PM2.5";

  POLLUTANT_CONFIG.forEach(({ key, breakpoints, label }) => {
    const subIndex = calcSubIndex(components[key], breakpoints);
    if (subIndex !== null && subIndex > maxAqi) {
      maxAqi = subIndex;
      mainPollutant = label;
    }
  });

  return {
    aqi: maxAqi,
    label: getUsAqiLabel(maxAqi),
    shortLabel: getUsAqiShortLabel(maxAqi),
    mainPollutant,
    markerPercent: Math.min((maxAqi / 300) * 100, 100),
  };
};
