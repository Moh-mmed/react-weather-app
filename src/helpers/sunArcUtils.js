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
 * Returns the fraction of the night that has elapsed (0–1).
 * Night goes from sunset → next sunrise.
 * Uses the actual sunrise from weather data + 24h when today's sunrise has passed.
 */
export const calculateNightProgress = (sunset, sunrise, dt) => {
  if (!Number.isFinite(sunset) || !Number.isFinite(sunrise) || !Number.isFinite(dt)) return 0;
  const nextSunrise = getNextSunrise(sunrise, dt);
  if (dt <= sunset) return 0;
  if (dt >= nextSunrise) return 1;
  return (dt - sunset) / (nextSunrise - sunset);
};

/**
 * Returns the next sunrise timestamp.
 * If today's sunrise has already passed, returns tomorrow's sunrise.
 * Otherwise returns today's sunrise.
 */
export const getNextSunrise = (sunrise, dt) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(dt)) return sunrise;
  if (dt < sunrise) return sunrise;
  return sunrise + 24 * 60 * 60;
};

/**
 * Returns the seconds until the next sunrise.
 */
export const getTimeUntilSunrise = (sunrise, dt) => {
  if (!Number.isFinite(sunrise) || !Number.isFinite(dt)) return null;
  const next = getNextSunrise(sunrise, dt);
  return Math.max(0, next - dt);
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

// ─── Moon phase ──────────────────────────────────────────────────────────────

const MOON_PHASES = [
  { key: 'newMoon',        emoji: '🌑', fraction: 0    },
  { key: 'waxingCrescent', emoji: '🌒', fraction: 0.125 },
  { key: 'firstQuarter',   emoji: '🌓', fraction: 0.25  },
  { key: 'waxingGibbous',  emoji: '🌔', fraction: 0.375 },
  { key: 'fullMoon',       emoji: '🌕', fraction: 0.5   },
  { key: 'waningGibbous',  emoji: '🌖', fraction: 0.625 },
  { key: 'lastQuarter',    emoji: '🌗', fraction: 0.75  },
  { key: 'waningCrescent', emoji: '🌘', fraction: 0.875 },
];

/**
 * Returns the approximate moon phase based on a known new-moon reference date.
 * Reference: Jan 6 2000 18:14 UTC (known new moon).
 */
export const getMoonPhase = (dt) => {
  const LUNAR_CYCLE = 29.53058867 * 24 * 3600; // seconds
  const REF_NEW_MOON = 947182440;               // Unix timestamp of reference new moon
  const elapsed = ((dt - REF_NEW_MOON) % LUNAR_CYCLE + LUNAR_CYCLE) % LUNAR_CYCLE;
  const fraction = elapsed / LUNAR_CYCLE;

  // Find the closest named phase
  const idx = Math.round(fraction * 8) % 8;
  return { ...MOON_PHASES[idx], exactFraction: fraction };
};

/**
 * Formats a duration in seconds as "Xh Ym".
 */
export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
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
