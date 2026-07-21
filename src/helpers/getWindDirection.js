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
  const normalized = Number(deg);
  if (!Number.isFinite(normalized)) {
    return { abbr: "--", full: "Unknown wind" };
  }

  const value = ((normalized % 360) + 360) % 360;
  const match =
    DIRECTIONS.find((dir) => value < dir.max) ||
    DIRECTIONS[DIRECTIONS.length - 1];

  return { abbr: match.abbr, full: match.full };
};

export const getWindDirectionAbbr = (deg, t) => {
  const abbr = getDirection(deg).abbr;
  if (t && abbr !== "--") {
    return t(`windDirections.${abbr}`, { defaultValue: abbr });
  }
  return abbr;
};
export const getWindDirectionFull = (deg) => getDirection(deg).full;
