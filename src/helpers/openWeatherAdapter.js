import { getDewPoint } from "./getDewPoint";
import {
  getLocationDateKey,
  getLocationHour,
  formatLocationTime,
} from "./weatherTime";

const HOUR_IN_SECONDS = 3600;
const OUTLOOK_HOURS = 48;

// ── Forecast normalization notes ─────────────────────────────────────────────
// Source: OpenWeather 5-day / 3-hour forecast endpoint. It returns ~40 samples
// (3-hourly) ≈ 5 days — a genuine 7-day daily forecast is NOT available from
// this endpoint. The adapter therefore:
//   • never fabricates a 6th/7th forecast day (no cloned days, no extrapolation)
//   • groups samples by the WEATHER LOCATION calendar day, using the endpoint's
//     `city.timezone` offset (seconds) via getLocationDateKey — independent of
//     the browser timezone
//   • derives daily high/low from the DAY'S ACTUAL sample temps (main.temp),
//     not from main.temp_min/temp_max (which are forecast-period fields)
//   • selects the representative daily condition from the day's midday sample
//     (11h–15h local) to avoid a nighttime icon standing for the whole day
//   • computes daily POP as the max sample probability (see below)
//   • exposes only real 3-hour forecast samples for the 48-hour outlook
//
// POP representation: OpenWeather `pop` is a 0–1 probability. Forecast/hourly
// samples keep the raw 0–1 fraction; the daily summary normalizes it to a
// 0–100 percentage (max sample POP × 100). Missing POP → null (never fake 0).

export const numOrNull = (v) => {
  if (
    v === null ||
    v === undefined ||
    (typeof v === "string" && v.trim() === "")
  ) {
    return null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Relative humidity has a physical domain: only a finite value in [0, 100]
// survives. Values outside that range (or missing) become null, while genuine
// 0% is preserved as a valid observation.
export const normalizeHumidity = (value) => {
  const humidity = numOrNull(value);

  if (humidity === null || humidity < 0 || humidity > 100) {
    return null;
  }

  return humidity;
};

export const normalizeWindSpeed = (v) => {
  const n = numOrNull(v);
  return n === null || n < 0 ? null : n;
};

const mapForecastEntry = (entry) => ({
  dt: entry.dt,
  temp: entry.main?.temp ?? null,
  pressure: entry.main?.pressure ?? null,
  weather: entry.weather,
  pop: Number.isFinite(entry.pop) ? entry.pop : null,
});

// Hourly (today): the current observation plus the forecast samples that fall
// on the same location calendar day. All values are API-derived; nothing is
// interpolated.
export const buildHourlyForToday = (forecastList, current, timezoneOffset) => {
  const todayDate = getLocationDateKey(current.dt, timezoneOffset);
  const todayEntries = (forecastList || [])
    .filter((entry) => getLocationDateKey(entry.dt, timezoneOffset) === todayDate)
    .map(mapForecastEntry);

  const currentEntry = {
    dt: current.dt,
    temp: current.temp,
    pressure: current.pressure ?? null,
    weather: current.weather,
    pop: null, // the current observation has no forecast POP
  };

  return [currentEntry, ...todayEntries].sort((a, b) => a.dt - b.dt);
};

// 48-hour outlook: ONLY actual forecast samples with dt in [now, now + 48h].
// Absolute Unix timestamps are used for the window; the location offset is
// used only for display fields. No synthetic hourly interpolation is produced.
export const build48HourForecast = (forecastList, nowSeconds, timezoneOffset) => {
  const endDt = nowSeconds + OUTLOOK_HOURS * HOUR_IN_SECONDS;

  return (forecastList || [])
    .filter((entry) => entry.dt >= nowSeconds && entry.dt <= endDt)
    .map((entry) => {
      const weather = { ...(entry.weather?.[0] ?? {}) };
      const temp = numOrNull(entry.main?.temp);
      const humidity = numOrNull(entry.main?.humidity);
      return {
        dt: entry.dt,
        localDate: getLocationDateKey(entry.dt, timezoneOffset),
        localTime: formatLocationTime(entry.dt, timezoneOffset, "HH:mm"),
        temp,
        feelsLike: numOrNull(entry.main?.feels_like),
        pressure: numOrNull(entry.main?.pressure),
        humidity,
        dewPoint: temp !== null && humidity !== null ? getDewPoint(temp, humidity) : null,
        windSpeed: normalizeWindSpeed(entry.wind?.speed),
        windDirection: numOrNull(entry.wind?.deg),
        windGust: normalizeWindSpeed(entry.wind?.gust),
        clouds: numOrNull(entry.clouds?.all),
        visibility: numOrNull(entry.visibility),
        pop: Number.isFinite(entry.pop) ? entry.pop : null,
        weatherId: weather.id ?? null,
        description: weather.description ?? null,
        icon: weather.icon ?? null,
        weather: entry.weather ?? [],
        isInterpolated: false,
      };
    });
};

// Daily summary grouped by the location calendar day. The first day is the
// current day (approach A): it aggregates the current observation together
// with any forecast samples still remaining for today — it is NOT presented
// as a complete "forecast for all of today".
export const buildGroupedDailySummary = (forecastList, current, timezoneOffset) => {
  const currentEntry = {
    dt: current.dt,
    main: {
      temp: current.temp,
      feels_like: current.feels_like ?? current.temp,
      humidity: current.humidity,
    },
    weather: current.weather,
    pop: null,
    wind: {
      speed: current.wind_speed,
      deg: current.wind_deg ?? null,
    },
  };

  const grouped = [currentEntry, ...(forecastList || [])].reduce((acc, item) => {
    const dateKey = getLocationDateKey(item.dt, timezoneOffset);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, items]) => {
      const temps = items
        .map((item) => numOrNull(item.main?.temp))
        .filter((temp) => temp !== null);
      const humidityValues = items
        .map((item) => numOrNull(item.main?.humidity))
        .filter((humidity) => humidity !== null);
      const windValues = items
        .map((item) => normalizeWindSpeed(item.wind?.speed))
        .filter((speed) => speed !== null);
      const popValues = items
        .map((item) => (Number.isFinite(item.pop) ? item.pop : null))
        .filter((pop) => pop !== null);

      if (!temps.length) {
        return null;
      }

      const min = Math.round(Math.min(...temps));
      const max = Math.round(Math.max(...temps));
      const maxPop = popValues.length ? Math.round(Math.max(...popValues) * 100) : null;
      const averageHumidity = humidityValues.length
        ? Math.round(
            humidityValues.reduce((sum, humidity) => sum + humidity, 0) /
              humidityValues.length
          )
        : null;
      const maxWind = windValues.length ? Math.max(...windValues) : null;

      // Representative condition: midday sample when available, else the first
      // sample of the day. Using an 11h–15h sample avoids a nighttime icon
      // standing in for the day's overall summary.
      const middayEntry =
        items.find((item) => {
          const hour = getLocationHour(item.dt, timezoneOffset);
          return hour !== null && hour >= 11 && hour <= 15;
        }) || items[0];

      return {
        date,
        dt: middayEntry.dt,
        sampleCount: items.length,
        temp: { day: max, min, max },
        feels_like: {
          day:
            middayEntry.main?.feels_like != null
              ? Math.round(middayEntry.main.feels_like)
              : null,
        },
        weather: middayEntry.weather,
        pop: maxPop,
        humidity: averageHumidity,
        wind_speed: maxWind,
      };
    })
    .filter(Boolean)
    // Daily summaries are always rendered chronologically. The grouping step
    // preserves insertion order (the current observation first), so an explicit
    // location-calendar sort guarantees ascending dates even for out-of-order
    // input. "YYYY-MM-DD" keys sort lexicographically = chronologically.
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const buildOpenWeatherPayload = (
  currentResponse,
  forecastResponse,
  uviResponse,
  options = {}
) => {
  const currentData = currentResponse.data;
  const main = currentData.main || {};
  const wind = currentData.wind || {};

  // OpenWeather already returns visibility in metres, capped at 10000 (10 km) —
  // no unit conversion happens here. All current numerics share the same
  // numOrNull policy so display and derivation components see one normalized
  // value (numeric string or missing can never diverge between consumers).
  const visibility = numOrNull(currentData.visibility);

  const current = {
    ...currentData,
    temp: numOrNull(main.temp),
    feels_like: numOrNull(main.feels_like),
    pressure: numOrNull(main.pressure),
    humidity: normalizeHumidity(main.humidity),
    visibility: visibility,
    wind_deg: numOrNull(wind.deg),
    wind_speed: normalizeWindSpeed(wind.speed),
    clouds: numOrNull(currentData.clouds?.all),
    sunrise: currentData.sys?.sunrise ?? null,
    sunset: currentData.sys?.sunset ?? null,
    uvi: numOrNull(uviResponse?.data?.value),
  };

  const timezone_offset = forecastResponse.data.city.timezone;
  const forecastList = forecastResponse.data.list || [];

  // Single "now" for the whole pipeline: consistent 48-hour filtering during
  // one render/build. Callers may pass options.nowSeconds for determinism.
  const nowSeconds = Number.isFinite(options.nowSeconds)
    ? options.nowSeconds
    : Math.floor(Date.now() / 1000);

  const hourly = buildHourlyForToday(forecastList, current, timezone_offset);
  const outlook48h = build48HourForecast(forecastList, nowSeconds, timezone_offset);
  const daily = buildGroupedDailySummary(forecastList, current, timezone_offset).slice(0, 7);
  const availableDays = daily.length;

  return {
    current,
    hourly,
    outlook24h: outlook48h,
    outlook48h,
    daily,
    timezone_offset,
    availableDays,
    dt: current.dt,
    coord: current.coord,
  };
};