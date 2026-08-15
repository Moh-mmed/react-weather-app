import axios from "axios";

const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export function getMoonPhaseName(phase) {
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

export function getMoonIllumination(phase) {
  return Math.round(((1 - Math.cos(phase * 2 * Math.PI)) / 2) * 100);
}

export function getNextFullMoon(phase) {
  const synodicMonth = 29.53058867;
  const days =
    phase < 0.5
      ? Math.round((0.5 - phase) * synodicMonth)
      : Math.round((1.5 - phase) * synodicMonth);
  return days === 0 ? "Tonight" : `${days} days`;
}

export function getNextNewMoon(phase) {
  const synodicMonth = 29.53058867;
  const days =
    phase < 0.03
      ? Math.round(synodicMonth)
      : Math.round((1 - phase) * synodicMonth);
  return days === 0 ? "Tonight" : `${days} days`;
}

export function parseTimeString(timeStr, use12h = false) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, "0");
  if (Number.isNaN(hours)) return null;
  if (use12h) {
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/** Format a Date as YYYY-MM-DD (Visual Crossing's datetime format). */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Pick the day to use for a per-day field (e.g. "moonrise").
 * Moonrise/moonset can be null on any given day (the moon doesn't always rise
 * or set), so prefer today, then the next day with a value, then the previous.
 * Handles todayIndex === -1 (today's date not found in the returned window).
 */
export function pickMoonDay(days, todayIndex, field) {
  // If todayIndex is valid, check today first
  if (todayIndex >= 0 && days[todayIndex]?.[field]) return days[todayIndex];
  // Scan forward from today (or from 0 when todayIndex is -1)
  const forwardStart = todayIndex >= 0 ? todayIndex + 1 : 0;
  for (let i = forwardStart; i < days.length; i++) {
    if (days[i]?.[field]) return days[i];
  }
  // Scan backward from the day before today (clamped so we never go negative)
  const backwardStart =
    todayIndex >= 0
      ? Math.min(todayIndex - 1, days.length - 1)
      : days.length - 1;
  for (let i = backwardStart; i >= 0; i--) {
    if (days[i]?.[field]) return days[i];
  }
  return null;
}

export async function fetchAstronomyData(lat, lon, use12h = false, cityName = null) {
  const key = process.env.REACT_APP_VISUAL_CROSSING_KEY;

  if (!key) {
    console.warn(
      "[astronomy] REACT_APP_VISUAL_CROSSING_KEY is not set — skipping Visual Crossing request",
    );
    return null;
  }

  // Request a ±2-day window around today: the moon often rises/sets only every
  // other day, so today's record alone frequently has moonrise/moonset null.
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 2);
  const end = new Date(now);
  end.setDate(now.getDate() + 2);

  const url = `${BASE_URL}/${lat},${lon}/${formatDate(start)}/${formatDate(end)}`;

  const response = await axios.get(url, {
    params: {
      unitGroup: "metric",
      include: "days,current",
      // The trial/free key only computes fields explicitly listed here — without
      // `elements`, moonrise/moonset come back null on every day.
      elements:
        "datetime,moonphase,moonrise,moonset,sunrise,sunset,solarnoon,daylength",
      key,
      contentType: "json",
    },
  });

  const days = response.data?.days;

  if (!Array.isArray(days) || days.length === 0) {
    console.warn("[astronomy] Visual Crossing response missing days");
    return null;
  }

  const todayKey = formatDate(now);
  const todayIndex = days.findIndex((day) => day.datetime === todayKey);
  const today =
    days[todayIndex] ?? days[Math.floor(days.length / 2)] ?? days[0];

  // Moonrise/moonset can be null on any given day (the moon doesn't always rise
  // or set). Fall back to the next day that has the value, then the previous.
  const moonriseDay = pickMoonDay(days, todayIndex, "moonrise");
  const moonsetDay = pickMoonDay(days, todayIndex, "moonset");

  const phase = today.moonphase ?? 0;

  const result = {
    // Moon
    moonPhase: phase,
    phaseName: getMoonPhaseName(phase),
    illumination: getMoonIllumination(phase),
    moonrise: parseTimeString(moonriseDay?.moonrise, use12h),
    moonset: parseTimeString(moonsetDay?.moonset, use12h),
    nextFullMoon: getNextFullMoon(phase),
    nextNewMoon: getNextNewMoon(phase),

    // Sun (more precise than OpenWeather's Unix timestamps, kept as strings)
    sunrise: parseTimeString(today.sunrise, use12h),
    sunset: parseTimeString(today.sunset, use12h),
    solarNoon: parseTimeString(today.solarnoon, use12h),
    dayLength: today.daylength ?? null, // decimal hours, e.g. 13.95

    // Raw for any component that needs to do its own formatting
    raw: {
      moonphase: phase,
      moonrise: moonriseDay?.moonrise ?? null,
      moonset: moonsetDay?.moonset ?? null,
      moonriseDate: moonriseDay?.datetime ?? null,
      moonsetDate: moonsetDay?.datetime ?? null,
      sunrise: today.sunrise,
      sunset: today.sunset,
    },
  };

  return result;
}
