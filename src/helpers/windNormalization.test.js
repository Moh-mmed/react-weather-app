import {
  numOrNull,
  normalizeWindSpeed,
  build48HourForecast,
  buildGroupedDailySummary,
  buildOpenWeatherPayload,
} from "./openWeatherAdapter";

const unixts = (year, month, day, hour = 0) =>
  Math.floor(Date.UTC(year, month - 1, day, hour) / 1000);

const fentry = (dt, over = {}) => ({
  dt,
  main: {
    temp: over.temp ?? 20,
    feels_like: over.feels_like ?? over.temp ?? 20,
    pressure: over.pressure ?? 1013,
    humidity: over.humidity ?? 50,
    temp_min: over.temp_min ?? over.temp ?? 20,
    temp_max: over.temp_max ?? over.temp ?? 20,
  },
  weather: [
    {
      id: over.id ?? 800,
      main: over.main ?? "Clear",
      description: over.description ?? "clear sky",
      icon: over.icon ?? "01d",
    },
  ],
  clouds: { all: over.clouds ?? 0 },
  wind: {
    speed: over.windSpeed ?? 3,
    deg: over.windDeg !== undefined ? over.windDeg : 180,
    gust: over.windGust,
  },
  visibility: 10000,
  pop: over.pop,
});

const currentOf = (dt, over = {}) => ({
  dt,
  temp: over.temp ?? 25,
  feels_like: over.feels_like ?? 25,
  pressure: 1010,
  humidity: 40,
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  wind_speed: over.wind_speed ?? 2,
  wind_deg: over.wind_deg ?? 90,
});

describe("numOrNull — hardened numeric normalization (W04)", () => {
  test("null / undefined / empty / whitespace strings → null (never 0)", () => {
    expect(numOrNull(null)).toBeNull();
    expect(numOrNull(undefined)).toBeNull();
    expect(numOrNull("")).toBeNull();
    expect(numOrNull("   ")).toBeNull();
  });

  test("valid numbers and numeric strings pass through", () => {
    expect(numOrNull(0)).toBe(0);
    expect(numOrNull("5")).toBe(5);
    expect(numOrNull(-5)).toBe(-5);
  });

  test("non-finite values are rejected", () => {
    expect(numOrNull(NaN)).toBeNull();
    expect(numOrNull(Infinity)).toBeNull();
    expect(numOrNull(-Infinity)).toBeNull();
  });
});

describe("normalizeWindSpeed — wind-specific speed normalization (W05)", () => {
  test("missing input → null", () => {
    expect(normalizeWindSpeed(null)).toBeNull();
    expect(normalizeWindSpeed(undefined)).toBeNull();
    expect(normalizeWindSpeed("")).toBeNull();
  });

  test("zero and positive speeds are preserved", () => {
    expect(normalizeWindSpeed(0)).toBe(0);
    expect(normalizeWindSpeed(5)).toBe(5);
    expect(normalizeWindSpeed("7")).toBe(7);
  });

  test("negative speeds are rejected (invalid observation)", () => {
    expect(normalizeWindSpeed(-1)).toBeNull();
    expect(normalizeWindSpeed(-Infinity)).toBeNull();
  });
});

describe("adapter integration — wind normalization through the build pipeline", () => {
  const now = unixts(2026, 8, 13, 12);

  test("48h outlook: negative speed/gust → null, missing deg → null (not 0)", () => {
    const bad = fentry(now + 10800, { windSpeed: -4, windGust: -6, windDeg: null });
    const series = build48HourForecast([bad], now, 3600);
    expect(series[0].windSpeed).toBeNull();
    expect(series[0].windGust).toBeNull();
    expect(series[0].windDirection).toBeNull();
  });

  test("48h outlook: valid wind values are preserved", () => {
    const ok = fentry(now + 10800, { windSpeed: 6, windGust: 10, windDeg: 270 });
    const series = build48HourForecast([ok], now, 3600);
    expect(series[0].windSpeed).toBe(6);
    expect(series[0].windGust).toBe(10);
    expect(series[0].windDirection).toBe(270);
  });

  test("daily summary: only negative samples → wind_speed null (no 0 or negative)", () => {
    const samples = [
      fentry(unixts(2026, 8, 13, 3), { windSpeed: -3 }),
      fentry(unixts(2026, 8, 13, 6), { windSpeed: -8 }),
    ];
    const daily = buildGroupedDailySummary(
      samples,
      currentOf(unixts(2026, 8, 12, 12)),
      3600
    );
    const day = daily.find((d) => d.date === "2026-08-13");
    expect(day.wind_speed).toBeNull();
  });

  test("daily summary: daily wind = max of valid samples, negatives ignored", () => {
    const samples = [
      fentry(unixts(2026, 8, 13, 3), { windSpeed: -3 }),
      fentry(unixts(2026, 8, 13, 6), { windSpeed: 9 }),
      fentry(unixts(2026, 8, 13, 9), { windSpeed: 5 }),
    ];
    const daily = buildGroupedDailySummary(
      samples,
      currentOf(unixts(2026, 8, 12, 12)),
      3600
    );
    const day = daily.find((d) => d.date === "2026-08-13");
    expect(day.wind_speed).toBe(9);
  });

  test("payload current: negative wind_speed → null; valid deg preserved", () => {
    const payload = buildOpenWeatherPayload(
      { data: { dt: now, main: { temp: 24 }, wind: { speed: -2, deg: 45 } } },
      { data: { city: { timezone: 0 }, list: [] } },
      { data: { value: 5 } },
      { nowSeconds: now }
    );
    expect(payload.current.wind_speed).toBeNull();
    expect(payload.current.wind_deg).toBe(45);

    const valid = buildOpenWeatherPayload(
      { data: { dt: now, main: { temp: 24 }, wind: { speed: 0, deg: 90 } } },
      { data: { city: { timezone: 0 }, list: [] } },
      { data: { value: 5 } },
      { nowSeconds: now }
    );
    expect(valid.current.wind_speed).toBe(0);
  });
});
