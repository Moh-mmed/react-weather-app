// US EPA AQI calculation from OpenWeather Air Pollution API components.
//
// ── Source units (OpenWeather air_pollution endpoint) ─────────────────────────
// Every pollutant concentration is returned in µg/m³:
//   co, no, no2, o3, so2, pm2_5, pm10, nh3
//
// ── EPA AQI breakpoint table units ───────────────────────────────────────────
// The breakpoint tables are expressed in other units, so the µg/m³ raw values
// MUST be converted before they can be compared against the tables:
//   PM2.5 → µg/m³  (24-hour average)  — no conversion
//   PM10  → µg/m³  (24-hour average)  — no conversion
//   O3    → ppm    (8-hour average)   — /1960
//   CO    → ppm    (8-hour average)   — /1150
//   NO2   → ppb    (1-hour average)   — µg/m³ · 1000 / 1880
//   SO2   → ppb    (1-hour average)   — µg/m³ · 1000 / 2620
//
// Conversion factors (25 °C, 1 atm, molar volume 24.45 L/mol) as used by the
// US EPA AQI calculator:
//   1 ppm O3  = 1960 µg/m³
//   1 ppm CO  = 1150 µg/m³
//   1 ppm NO2 = 1880 µg/m³
//   1 ppm SO2 = 2620 µg/m³
//
// ── Averaging-period limitation (documented) ─────────────────────────────────
// An official US EPA AQI requires averaged concentrations: 24-hour PM averages,
// 8-hour O3/CO averages, 1-hour NO2/SO2 averages. OpenWeather's air_pollution
// endpoint returns a single instantaneous snapshot per request. This module
// therefore computes an EPA-STYLE AQI estimate from the instantaneous sample
// (correct conversions, correct breakpoints, correct interpolation) but does
// NOT pretend the sample is a true multi-hour average. AQI from these data is
// a defensible approximation of the official index, not an official value.

// OpenWeather → EPA AQI unit conversion. Gases come in µg/m³.
const UG_M3_PER_PPM = { o3: 1960, co: 1150, no2: 1880, so2: 2620 };

const ppmToPpb = (ppm) => ppm * 1000;

// EPA AQI categories (US AQI scale). Ranges are inclusive of the upper bound.
const CATEGORY_BREAKS = [
  { max: 50, label: "Good" },
  { max: 100, label: "Moderate" },
  { max: 150, label: "USG" },
  { max: 200, label: "Unhealthy" },
  { max: 300, label: "Very Unhealthy" },
  { max: 500, label: "Hazardous" },
];

// Pollutant descriptors: EPA breakpoint tables expressed in EPA AQI units,
// with unit conversion, rounding precision and display metadata.
//
// Breakpoint row layout: [C_low, C_high, I_low, I_high]
const POLLUTANT_ORDER = ["pm2_5", "pm10", "o3", "co", "no2", "so2"];

const POLLUTANT_DEFS = {
  pm2_5: {
    fullName: "PM2.5",
    sourceUnit: "µg/m³",
    aqiUnit: "µg/m³",
    averaging: "24-hour",
    precision: 0.1, // EPA: PM2.5 rounded to nearest 0.1 µg/m³ before AQI
    toAqiUnits: (v) => v,
    breakpoints: [
      [0, 12.0, 0, 50],
      [12.1, 35.4, 51, 100],
      [35.5, 55.4, 101, 150],
      [55.5, 150.4, 151, 200],
      [150.5, 250.4, 201, 300],
      [250.5, 500.4, 301, 500],
    ],
  },
  pm10: {
    fullName: "PM10",
    sourceUnit: "µg/m³",
    aqiUnit: "µg/m³",
    averaging: "24-hour",
    precision: 1, // EPA: PM10 rounded to nearest integer µg/m³ before AQI
    toAqiUnits: (v) => v,
    breakpoints: [
      [0, 54, 0, 50],
      [55, 154, 51, 100],
      [155, 254, 101, 150],
      [255, 354, 151, 200],
      [355, 424, 201, 300],
      [425, 604, 301, 500],
    ],
  },
  o3: {
    fullName: "O₃",
    sourceUnit: "µg/m³",
    aqiUnit: "ppm",
    averaging: "8-hour",
    precision: 0.001, // EPA: 8-hour O3 rounded to nearest 0.001 ppm before AQI
    toAqiUnits: (v) => v / UG_M3_PER_PPM.o3,
    breakpoints: [
      [0, 0.054, 0, 50],
      [0.055, 0.07, 51, 100],
      [0.071, 0.085, 101, 150],
      [0.086, 0.105, 151, 200],
      [0.106, 0.2, 201, 300],
    ],
    // EPA: when the 8-hour O3 would exceed 0.200 ppm, AQI>300 is computed
    // from the 1-hour average instead.
    breakpoints1h: [
      [0.125, 0.164, 301, 400],
      [0.165, 0.204, 401, 500],
    ],
  },
  co: {
    fullName: "CO",
    sourceUnit: "µg/m³",
    aqiUnit: "ppm",
    averaging: "8-hour",
    precision: 0.1, // EPA: 8-hour CO rounded to nearest 0.1 ppm before AQI
    toAqiUnits: (v) => v / UG_M3_PER_PPM.co,
    breakpoints: [
      [0, 4.4, 0, 50],
      [4.5, 9.4, 51, 100],
      [9.5, 12.4, 101, 150],
      [12.5, 15.4, 151, 200],
      [15.5, 30.4, 201, 300],
      [30.5, 50.4, 301, 500],
    ],
  },
  no2: {
    fullName: "NO₂",
    sourceUnit: "µg/m³",
    aqiUnit: "ppb",
    averaging: "1-hour",
    precision: 1, // EPA: 1-hour NO2 rounded to nearest integer ppb before AQI
    toAqiUnits: (v) => ppmToPpb(v / UG_M3_PER_PPM.no2),
    breakpoints: [
      [0, 53, 0, 50],
      [54, 100, 51, 100],
      [101, 360, 101, 150],
      [361, 649, 151, 200],
      [650, 1249, 201, 300],
      [1250, 2049, 301, 500],
    ],
  },
  so2: {
    fullName: "SO₂",
    sourceUnit: "µg/m³",
    aqiUnit: "ppb",
    averaging: "1-hour",
    precision: 1, // EPA: 1-hour SO2 rounded to nearest integer ppb before AQI
    toAqiUnits: (v) => ppmToPpb(v / UG_M3_PER_PPM.so2),
    breakpoints: [
      [0, 35, 0, 50],
      [36, 75, 51, 100],
      [76, 185, 101, 150],
      [186, 304, 151, 200],
      [305, 604, 201, 300],
      [605, 1004, 301, 500],
    ],
  },
};

const DECIMALS = { 0.001: 3, 0.1: 1, 1: 0 };

// Round a concentration to the precision required by the pollutant before the
// breakpoint lookup (EPA practice). Also closes the between-band gaps that
// arise from discontinuous breakpoint tables.
const roundTo = (value, precision) => {
  const scale = 1 / precision;
  const rounded = Math.round(value * scale) / scale;
  const decimals = DECIMALS[precision] ?? 0;
  return Number(rounded.toFixed(decimals));
};

const interpolateAqi = (concentration, [cLow, cHigh, iLow, iHigh]) => {
  const aqi = ((iHigh - iLow) / (cHigh - cLow)) * (concentration - cLow) + iLow;
  return Math.round(aqi);
};

const aqiFromBreakpoints = (concentration, breakpoints, breakpoints1h) => {
  let bands = breakpoints;
  const eightHourMax = breakpoints[breakpoints.length - 1][1];
  if (concentration > eightHourMax && breakpoints1h) bands = breakpoints1h;

  for (const band of bands) {
    const [cLow, cHigh] = band;
    if (concentration >= cLow && concentration <= cHigh) {
      return interpolateAqi(concentration, band);
    }
  }
  return null;
};

// Pure, deterministic US EPA AQI calculation.
//
// Accepts an OpenWeather air pollution `components` object (µg/m³ values) and
// returns:
//   {
//     usAqi:             number|null  overall AQI = highest valid sub-index
//     category:          string|null  US AQI category label
//     dominantPollutant: string|null  pollutant key with the highest sub-index
//     pollutants:        { key: { concentration, unit, aqiUnit, averaging,
//                                 aqi } }
//     pollutantSubIndices: { key: number|null }
//   }
//
// Missing/invalid concentrations are skipped (never treated as 0). When no
// pollutant yields a valid AQI, usAqi is null.
export const calculateUsAqi = (components = {}) => {
  const pollutantSubIndices = {};
  const pollutants = {};
  let usAqi = null;
  let dominantPollutant = null;

  for (const key of POLLUTANT_ORDER) {
    const def = POLLUTANT_DEFS[key];
    const raw = components[key];

    pollutants[key] = {
      concentration: null,
      unit: def.sourceUnit,
      aqiUnit: def.aqiUnit,
      averaging: def.averaging,
      aqi: null,
    };

    if (raw === undefined || raw === null) continue;

    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric < 0) continue;

    const prepared = roundTo(def.toAqiUnits(numeric), def.precision);
    const subIndex = aqiFromBreakpoints(prepared, def.breakpoints, def.breakpoints1h);

    pollutants[key] = {
      concentration: numeric,
      unit: def.sourceUnit,
      aqiUnit: def.aqiUnit,
      averaging: def.averaging,
      aqi: subIndex,
    };
    pollutantSubIndices[key] = subIndex;

    if (subIndex !== null && (usAqi === null || subIndex > usAqi)) {
      usAqi = subIndex;
      dominantPollutant = key;
    }
  }

  return {
    usAqi,
    category: usAqi === null ? null : getUsAqiLabel(usAqi, null),
    dominantPollutant,
    pollutants,
    pollutantSubIndices,
  };
};

export const getUsAqiLabel = (aqi, t) => {
  if (!Number.isFinite(aqi)) return t ? t("aqi.categories.unknown") : "Unknown";
  if (aqi <= 50) return t ? t("aqi.categories.good") : "Good";
  if (aqi <= 100) return t ? t("aqi.categories.moderate") : "Moderate";
  if (aqi <= 150) return t ? t("aqi.categories.usg") : "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return t ? t("aqi.categories.unhealthy") : "Unhealthy";
  if (aqi <= 300) return t ? t("aqi.categories.veryUnhealthy") : "Very Unhealthy";
  return t ? t("aqi.categories.hazardous") : "Hazardous";
};

export const getUsAqiShortLabel = (aqi, t) => {
  if (!Number.isFinite(aqi)) return t ? t("aqi.shortCategories.unknown") : "Unknown";
  if (aqi <= 50) return t ? t("aqi.shortCategories.good") : "Good";
  if (aqi <= 100) return t ? t("aqi.shortCategories.moderate") : "Moderate";
  if (aqi <= 150) return t ? t("aqi.shortCategories.usg") : "USG";
  if (aqi <= 200) return t ? t("aqi.shortCategories.unhealthy") : "Unhealthy";
  if (aqi <= 300) return t ? t("aqi.shortCategories.veryUnhealthy") : "Very Unhealthy";
  return t ? t("aqi.shortCategories.hazardous") : "Hazardous";
};

// UI-facing wrapper around calculateUsAqi. Keeps the historical return shape
// (aqi, label, shortLabel, mainPollutant, markerPercent) used by the Air
// Quality panels and adds the normalized AQI model.
export const getUsAqiFromComponents = (components = {}, t) => {
  const result = calculateUsAqi(components);
  const aqi = result.usAqi;

  return {
    aqi,
    usAqi: aqi,
    label: getUsAqiLabel(aqi, t),
    shortLabel: getUsAqiShortLabel(aqi, t),
    mainPollutant:
      aqi === null || result.dominantPollutant === null
        ? null
        : POLLUTANT_DEFS[result.dominantPollutant].fullName,
    markerPercent: aqi === null ? 0 : Math.min((aqi / 300) * 100, 100),
    category: getUsAqiLabel(aqi, null),
    dominantPollutant: result.dominantPollutant,
    pollutants: result.pollutants,
    pollutantSubIndices: result.pollutantSubIndices,
  };
};

export const US_AQI_POLLUTANT_KEYS = POLLUTANT_ORDER;
export const US_AQI_POLLUTANT_DEFS = POLLUTANT_DEFS;
export const US_AQI_CATEGORIES = CATEGORY_BREAKS;