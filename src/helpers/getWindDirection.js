const CARDINAL_OF = {
  N: "N",
  NNE: "N",
  NE: "E",
  ENE: "E",
  E: "E",
  ESE: "E",
  SE: "S",
  SSE: "S",
  S: "S",
  SSW: "S",
  SW: "W",
  WSW: "W",
  W: "W",
  WNW: "W",
  NW: "N",
  NNW: "N",
};

const DIRECTIONS = [
  { max: 11, abbr: "N", full: "North" },
  { max: 33, abbr: "NNE", full: "North Northeast" },
  { max: 56, abbr: "NE", full: "Northeast" },
  { max: 78, abbr: "ENE", full: "East Northeast" },
  { max: 101, abbr: "E", full: "East" },
  { max: 123, abbr: "ESE", full: "East Southeast" },
  { max: 146, abbr: "SE", full: "Southeast" },
  { max: 168, abbr: "SSE", full: "South Southeast" },
  { max: 191, abbr: "S", full: "South" },
  { max: 213, abbr: "SSW", full: "South Southwest" },
  { max: 236, abbr: "SW", full: "Southwest" },
  { max: 258, abbr: "WSW", full: "West Southwest" },
  { max: 281, abbr: "W", full: "West" },
  { max: 303, abbr: "WNW", full: "West Northwest" },
  { max: 326, abbr: "NW", full: "Northwest" },
  { max: 348, abbr: "NNW", full: "North Northwest" },
];

const getDirection = (deg) => {
  if (
    deg === null ||
    deg === undefined ||
    (typeof deg === "string" && deg.trim() === "")
  ) {
    return { abbr: "--", full: "Unknown wind" };
  }
  const normalized = Number(deg);
  if (!Number.isFinite(normalized)) {
    return { abbr: "--", full: "Unknown wind" };
  }

  const value = ((normalized % 360) + 360) % 360;
  const index = Math.round(value / 22.5) % 16;
  return DIRECTIONS[index];
};

export const getWindDirectionAbbr = (deg, t) => {
  const abbr = getDirection(deg).abbr;
  if (t && abbr !== "--") {
    return t(`windDirections.${abbr}`, { defaultValue: abbr });
  }
  return abbr;
};
export const getWindDirectionFull = (deg) => getDirection(deg).full;

export const getWindDirectionCardinal = (deg) => {
  const abbr = getDirection(deg).abbr;
  return CARDINAL_OF[abbr] || abbr;
};
