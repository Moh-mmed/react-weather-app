// Central, browser-timezone-independent timezone helpers.
//
// OpenWeather timestamps (dt) are absolute Unix seconds. Forecast day grouping
// and local time display must use the WEATHER LOCATION's UTC offset
// (seconds, e.g. forecast.city.timezone / current.timezone), never the
// browser's local timezone or dt_txt string slicing.
//
// All functions compute the location's local wall-clock fields by applying
// the fixed offset with a UTC-only interpretation, so results are identical
// regardless of the machine/browser timezone.
import moment from "moment";

const num = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Location-local wall-clock fields as a plain object { year, month, day,
// hour, minute }. Returns null for invalid input.
export const toLocationDate = (timestampSeconds, timezoneOffsetSeconds) => {
  const ts = num(timestampSeconds);
  const offset = num(timezoneOffsetSeconds);
  if (ts === null || offset === null) return null;

  const m = moment.unix(ts).utcOffset(offset / 3600);
  return {
    year: m.year(),
    month: m.month() + 1, // 1-12
    day: m.date(),
    hour: m.hour(),
    minute: m.minute(),
  };
};

// Location-local calendar day, e.g. "2026-08-13".
export const getLocationDateKey = (timestampSeconds, timezoneOffsetSeconds) => {
  const local = toLocationDate(timestampSeconds, timezoneOffsetSeconds);
  if (!local) return null;
  return `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
};

// Location-local hour of day (0-23). Null for invalid input.
export const getLocationHour = (timestampSeconds, timezoneOffsetSeconds) => {
  const local = toLocationDate(timestampSeconds, timezoneOffsetSeconds);
  return local ? local.hour : null;
};

// Location-local time formatted with a moment format string. "HH:mm" gives
// e.g. "15:00". Returns "--" for invalid input.
export const formatLocationTime = (timestampSeconds, timezoneOffsetSeconds, format = "HH:mm") => {
  const ts = num(timestampSeconds);
  const offset = num(timezoneOffsetSeconds);
  if (ts === null || offset === null) return "--";
  return moment.unix(ts).utcOffset(offset / 3600).format(format);
};

// Classify a "YYYY-MM-DD" date key (already in the weather location's calendar)
// relative to the location's current calendar day. Returns "Today", "Tomorrow",
// "Yesterday", or a short weekday name for any other day. The comparison uses
// the location calendar via getLocationDateKey — the browser timezone can never
// change the result. Returns null when the date key or timezone offset is
// invalid or the current instant cannot be resolved. An optional `locale`
// controls the weekday formatting language (defaults to the browser locale).
export const getDayLabel = (dateKey, nowUnix, timezoneOffsetSeconds, locale) => {
  if (!dateKey) return null;
  const todayKey = getLocationDateKey(nowUnix, timezoneOffsetSeconds);
  if (!todayKey) return null;

  const parseUtc = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const diff = Math.round((parseUtc(dateKey) - parseUtc(todayKey)) / 86400000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";

  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    weekday: "short",
  });
};