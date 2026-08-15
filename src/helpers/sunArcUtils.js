/**
 * sunArcUtils.js
 * Pure utility functions for the dynamic sky visualization.
 * No React imports — safe to memoize and call from anywhere.
 */

// ─── Phase boundaries (seconds offset from sunrise / sunset) ─────────────────
const DAWN_START_OFFSET = -30 * 60;       // 30 min before sunrise
const MORNING_END_OFFSET = 2 * 60 * 60;   // 2 hours after sunrise
const SUNSET_START_OFFSET = -45 * 60;     // 45 min before sunset
const SUNSET_END_OFFSET = 20 * 60;        // 20 min after sunset
const BLUE_HOUR_END_OFFSET = 40 * 60;     // 40 min after sunset

/**
 * Returns the fraction of the daytime that has elapsed (0–1).
 * Returns 0 when it is night, 1 when day has ended.
 */
export const calculateSunProgress = (sunrise, sunset, dt) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset) || !Number.isFinite(dt)) return 0;
  if (dt <= sunrise) return 0;
  if (dt >= sunset) return 1;
  return (dt - sunrise) / (sunset - sunrise);
};

/**
 * Returns the timestamp of the next sunrise relative to `dt`.
 *
 * Before today's sunrise has happened, returns today's sunrise. Once it has
 * passed, the caller should supply the ACTUAL next-day sunrise (`nextSunrise`),
 * e.g. from a multi-day astronomy response, so DST transitions and changing
 * day length are respected. A fixed `+24h` fallback exists only for legacy
 * callers that have no next-day value available; it is explicitly an
 * approximation (incorrect across DST / day-length changes) and should not be
 * relied on.
 *
 * @param {number} sunrise today's sunrise (Unix seconds)
 * @param {number} dt current Unix seconds
 * @param {number} [nextSunrise] the actual following sunrise (Unix seconds).
 *        Used verbatim when finite and strictly after `sunrise`.
 * @returns {number} next sunrise Unix seconds (or `sunrise` when inputs are invalid).
 */
export const getNextSunrise = (sunrise, dt, nextSunrise) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(dt)) return sunrise;
  if (dt < sunrise) return sunrise;
  if (Number.isFinite(nextSunrise) && nextSunrise > sunrise) return nextSunrise;
  return sunrise + 24 * 60 * 60;
};

/**
 * Returns the seconds until the next sunrise.
 * Accepts the same optional actual next-day sunrise as getNextSunrise.
 */
export const getTimeUntilSunrise = (sunrise, dt, nextSunrise) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(dt)) return null;
  const next = getNextSunrise(sunrise, dt, nextSunrise);
  return Math.max(0, next - dt);
};

/**
 * Converts a "YYYY-MM-DD" + "HH:MM:SS" pair (in the location's local time)
 * into a Unix timestamp, using the same timezone_offset convention as
 * OpenWeather (seconds east of UTC).
 */
export const localTimeStringToUnix = (dateStr, timeStr, timezoneOffsetSeconds) => {
  if (!dateStr || !timeStr || !Number.isFinite(timezoneOffsetSeconds)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hh, mm, ss = 0] = timeStr.split(":").map(Number);
  if (![year, month, day, hh, mm].every(Number.isFinite)) return null;
  const utcMillis = Date.UTC(year, month - 1, day, hh, mm, ss) - timezoneOffsetSeconds * 1000;
  return Math.floor(utcMillis / 1000);
};

/**
 * Given the moon's actual rise/set timestamps, returns whether it's
 * currently above the horizon and how far through its pass it is (0→1),
 * for positioning on the arc.
 */
export const getMoonVisibility = (moonriseTs, moonsetTs, dt) => {
  if (!Number.isFinite(moonriseTs) || !Number.isFinite(moonsetTs) || !Number.isFinite(dt)) {
    return { isUp: false, progress: 0 };
  }
  if (moonriseTs <= moonsetTs) {
    // Normal case: this rise happens before this set.
    if (dt < moonriseTs || dt > moonsetTs) return { isUp: false, progress: 0 };
    return { isUp: true, progress: (dt - moonriseTs) / (moonsetTs - moonriseTs) };
  }
  // TODO: This moonset belongs to an earlier rise we don't have on hand — the
  // moon is up from some prior rise until this set, then down again until this
  // rise. progress is approximated as 1 here; widening the Visual Crossing
  // fetch window one extra day backward (astronomyService.js fetchAstronomyData)
  // would resolve it exactly.
  if (dt <= moonsetTs) return { isUp: true, progress: 1 };
  if (dt >= moonriseTs) return { isUp: true, progress: 0 };
  return { isUp: false, progress: 0 };
};

/**
 * Returns the current sky phase based on dt vs sunrise/sunset.
 * @returns {'dawn'|'morning'|'day'|'sunset'|'blue-hour'|'night'}
 */
export const getSkyPhase = (dt, sunrise, sunset) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset) || !Number.isFinite(dt)) {
    return 'day';
  }
  const dawnStart = sunrise + DAWN_START_OFFSET;
  const morningEnd = sunrise + MORNING_END_OFFSET;
  const sunsetStart = sunset + SUNSET_START_OFFSET;
  const sunsetEnd = sunset + SUNSET_END_OFFSET;
  const blueHourEnd = sunset + BLUE_HOUR_END_OFFSET;

  if (dt < dawnStart) return 'night';
  if (dt < sunrise) return 'dawn';
  if (dt < morningEnd) return 'morning';
  if (dt < sunsetStart) return 'day';
  if (dt < sunsetEnd) return 'sunset';
  if (dt < blueHourEnd) return 'blue-hour';
  return 'night';
};

/** Returns true when the sun is below the horizon. */
export const isNight = (dt, sunrise, sunset) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset) || !Number.isFinite(dt)) return false;
  return dt < sunrise || dt >= sunset;
};

/** Returns true for dusk/blue-hour phase. */
export const isBlueHour = (dt, sunrise, sunset) => {
  const phase = getSkyPhase(dt, sunrise, sunset);
  return phase === 'blue-hour';
};

// ─── Sky gradient palettes ────────────────────────────────────────────────────

const SKY_PALETTES = {
  dawn:        { top: '#1a2a4a', mid: '#3d4f6b', bottom: '#7a6a55' },
  morning:     { top: '#1a5c7a', mid: '#3d98c8', bottom: '#b8dcea' },
  day:         { top: '#1468a0', mid: '#3498d4', bottom: '#a0d4f0' },
  sunset:      { top: '#6a2255', mid: '#d4404a', bottom: '#e8702a' },
  'blue-hour': { top: '#0f1e3e', mid: '#1f3468', bottom: '#334d78' },
  night:       { top: '#08131F', mid: '#11243A', bottom: '#23415D' },
};

/**
 * Returns interpolated sky gradient stops for the current phase.
 * `t` is 0→1 progress within the sunset transition window.
 */
export const getSkyGradient = (phase, t = 0) => {
  if (phase !== 'sunset') return SKY_PALETTES[phase] || SKY_PALETTES.day;

  // Sunset: blend from day palette → sunset palette → blue-hour palette
  const from = t < 0.5 ? SKY_PALETTES.day : SKY_PALETTES.sunset;
  const to   = t < 0.5 ? SKY_PALETTES.sunset : SKY_PALETTES['blue-hour'];
  const tt   = t < 0.5 ? t * 2 : (t - 0.5) * 2;

  return {
    top:    lerpColor(from.top, to.top, tt),
    mid:    lerpColor(from.mid, to.mid, tt),
    bottom: lerpColor(from.bottom, to.bottom, tt),
  };
};

// ─── Sun color ───────────────────────────────────────────────────────────────

/**
 * Returns the sun fill color based on phase and sunset progress t (0→1).
 */
export const getSunColor = (phase, t = 0) => {
  switch (phase) {
    case 'dawn':    return '#ffb347';
    case 'morning': return '#ffd56b';
    case 'day':     return '#f4c12a';
    case 'sunset':
      // Yellow → orange → deep-red as t goes 0→1
      if (t < 0.5) return lerpColor('#f4c12a', '#f09020', t * 2);
      return lerpColor('#f09020', '#c83010', (t - 0.5) * 2);
    case 'blue-hour': return '#c83010';
    default:        return '#f4c12a'; // night → sun is hidden anyway
  }
};

// ─── Color interpolation helper ───────────────────────────────────────────────

/**
 * Linearly interpolates between two hex color strings.
 * @param {string} a - hex color e.g. '#ff0000'
 * @param {string} b - hex color
 * @param {number} t - 0→1
 */
export const lerpColor = (a, b, t) => {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return rgbToHex(r, g, bl);
};

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
};

/**
 * Returns the sunset transition progress t (0→1) within the sunset window.
 * 0 = just entered sunset phase, 1 = end of blue-hour.
 */
export const getSunsetProgress = (dt, sunset) => {
  if (!Number.isFinite(dt) || !Number.isFinite(sunset)) return 0;
  const start = sunset + SUNSET_START_OFFSET;
  const end = sunset + BLUE_HOUR_END_OFFSET;
  return Math.max(0, Math.min(1, (dt - start) / (end - start)));
};
