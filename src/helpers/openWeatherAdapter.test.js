import {
  buildHourlyForToday,
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
  wind: { speed: over.windSpeed ?? 3, deg: over.windDeg ?? 180, gust: over.windGust },
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
  wind_speed: 2,
  wind_deg: 90,
});

const BEIJING = 28800;

describe("buildGroupedDailySummary — timezone-safe grouping", () => {
  test("same UTC timestamps group by the LOCATION calendar day (Beijing UTC+8)", () => {
    // UTC 20:00 / 23:00 on Aug 13 + 06:00 on Aug 14 are all Aug 14 in Beijing.
    const samples = [
      fentry(unixts(2026, 8, 13, 20), { temp: 30 }),
      fentry(unixts(2026, 8, 13, 23), { temp: 26 }),
      fentry(unixts(2026, 8, 14, 6), { temp: 28 }),
      fentry(unixts(2026, 8, 12, 20), { temp: 22 }), // local Aug 13
    ];
    const current = currentOf(unixts(2026, 8, 13, 12)); // local Aug 13 20:00
    const daily = buildGroupedDailySummary(samples, current, BEIJING);

    expect(daily.map((d) => d.date)).toEqual(["2026-08-13", "2026-08-14"]);
    expect(daily.map((d) => d.sampleCount)).toEqual([2, 3]);
  });

  test("the same timestamps split differently for Algiers (UTC+1)", () => {
    const samples = [
      fentry(unixts(2026, 8, 13, 20), { temp: 30 }), // local Aug 13 21:00
      fentry(unixts(2026, 8, 13, 23), { temp: 26 }), // local Aug 14 00:00
      fentry(unixts(2026, 8, 14, 6), { temp: 28 }), // local Aug 14 07:00
      fentry(unixts(2026, 8, 12, 20), { temp: 22 }), // local Aug 12 21:00
    ];
    const current = currentOf(unixts(2026, 8, 13, 12)); // local Aug 13 13:00
    const daily = buildGroupedDailySummary(samples, current, 3600);

    expect(daily.map((d) => d.date)).toEqual([
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
    ]);
    expect(daily.map((d) => d.sampleCount)).toEqual([1, 2, 2]);
  });
});

describe("buildGroupedDailySummary — daily values", () => {
  test("high/low derive from the day's ACTUAL sample temps", () => {
    const dt0 = unixts(2026, 8, 13, 0);
    const samples = [30, 20, 25, 18].map((t, i) => fentry(dt0 + i * 10800, { temp: t }));
    const daily = buildGroupedDailySummary(samples, currentOf(unixts(2026, 8, 12, 12)), 3600);
    const day = daily.find((d) => d.date === "2026-08-13");
    expect(day.temp.max).toBe(30);
    expect(day.temp.min).toBe(18);
  });

  test("daily POP = max sample POP × 100 (0–100 %); missing POP → null", () => {
    const dt0 = unixts(2026, 8, 13, 0);
    const samples = [0.2, 0.8, 0.5].map((p, i) => fentry(dt0 + i * 10800, { pop: p }));
    const daily = buildGroupedDailySummary(samples, currentOf(unixts(2026, 8, 12, 12)), 3600);
    expect(daily.find((d) => d.date === "2026-08-13").pop).toBe(80);

    const missing = [fentry(dt0), fentry(dt0 + 10800)]; // no pop field
    const dailyMissing = buildGroupedDailySummary(
      missing,
      currentOf(unixts(2026, 8, 12, 12)),
      3600
    );
    expect(dailyMissing.find((d) => d.date === "2026-08-13").pop).toBeNull();
  });

  test("representative condition uses the midday (11–15h) sample, not the first", () => {
    // Night sample first at 00:00 local, clear daytime sample at 14:00 local.
    const dtNoon = unixts(2026, 8, 13, 6); // UTC 06:00 → Beijing 14:00
    const samples = [
      fentry(dtNoon - 28800, { icon: "01d", id: 800, main: "Clear" }), // 05:00 Aug 13 local (night icon)
      fentry(dtNoon, { icon: "01d", id: 800, main: "Clear" }),
    ];
    const daily = buildGroupedDailySummary(
      samples,
      currentOf(unixts(2026, 8, 12, 12)),
      BEIJING
    );
    const day = daily.find((d) => d.date === "2026-08-13");
    // The 14:00 local sample (midday band) becomes the representative weather.
    expect(day.dt).toBe(dtNoon);
    expect(day.weather[0].icon).toBe("01d");
  });

  test("high is never below low when finite", () => {
    const dt0 = unixts(2026, 8, 13, 0);
    const samples = [12, 9, 15, 8, 14].map((t, i) => fentry(dt0 + i * 10800, { temp: t }));
    const daily = buildGroupedDailySummary(samples, currentOf(unixts(2026, 8, 12, 12)), 3600);
    const validMaxes = daily.filter((d) => d.temp.max !== null);
    expect(validMaxes.every((d) => d.temp.max >= d.temp.min)).toBe(true);
  });

  test("late-night case (ISSUE #2): missing midday samples → temp.max is null, isHighIncomplete is true", () => {
    // Current observation at 22:25 local (UTC+1 = 21:25 UTC) with temp 28°C
    const currentNight = currentOf(unixts(2026, 8, 13, 21, 25), { temp: 28 });
    // Forecast list has only surviving late-night sample at 23:00 local (22:00 UTC)
    const lateNightSample = fentry(unixts(2026, 8, 13, 22), { temp: 27 });

    const daily = buildGroupedDailySummary([lateNightSample], currentNight, 3600);
    const today = daily.find((d) => d.date === "2026-08-13");

    expect(today.isHighIncomplete).toBe(true);
    expect(today.temp.max).toBeNull();
    // Low temperature (min of surviving late-night samples) is still preserved
    expect(today.temp.min).toBe(27);
  });
});

describe("no fabricated forecast days", () => {
  test("6 distinct location days produce 6 days (old code forged a 7th)", () => {
    // Beijing: a midday local sample for each of 08-13..08-18 plus current.
    const samples = [13, 14, 15, 16, 17, 18].map((day) =>
      fentry(unixts(2026, 8, day, 4), { temp: 25 })
    );
    const current = currentOf(unixts(2026, 8, 13, 12));
    const daily = buildGroupedDailySummary(samples, current, BEIJING);

    expect(daily.length).toBe(6);
    const dates = daily.map((d) => d.date);
    expect(new Set(dates).size).toBe(6); // no duplicated/cloned day
    expect(dates).not.toContain("2026-08-19"); // nothing fabricated after the last real day
  });

  test("fewer than 7 available days are returned as-is", () => {
    const samples = [14, 15, 16, 17, 18].map((day) =>
      fentry(unixts(2026, 8, day, 4), { temp: 25 })
    );
    const current = currentOf(unixts(2026, 8, 13, 12));
    const daily = buildGroupedDailySummary(samples, current, BEIJING);
    // The current observation legitimately adds the location-local "today"
    // (Aug 13) as its own group, so 5 sample-days + current = 6 local days.
    expect(daily.length).toBe(6);
    // Chronologically sorted by location date, no fabricated tail day.
    const dates = daily.map((d) => d.date);
    expect(dates).toEqual(["2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16", "2026-08-17", "2026-08-18"]);
  });
});

describe("build48HourForecast — real 3-hour samples only", () => {
  const now = unixts(2026, 8, 13, 12);

  test("includes samples in [now, now+48h], excludes older and beyond", () => {
    const samples = [];
    for (let i = 1; i <= 18; i++) {
      samples.push(fentry(now + i * 10800)); // +3h..+54h
    }
    const series = build48HourForecast(samples, now, 3600);

    expect(series.length).toBe(16); // +3h..+48h
    expect(series[0].dt).toBe(now + 10800);
    expect(series[series.length - 1].dt).toBe(now + 48 * 3600);
    for (const s of series) {
      expect(s.dt).toBeGreaterThanOrEqual(now);
      expect(s.dt).toBeLessThanOrEqual(now + 48 * 3600);
      expect(s.isInterpolated).toBe(false);
    }
  });

  test("contains no synthetic timestamps (only actual sample dts)", () => {
    const samples = [];
    for (let i = 0; i <= 16; i++) samples.push(fentry(now + i * 10800));
    const series = build48HourForecast(samples, now, 3600);
    const actualDts = new Set(samples.map((s) => s.dt));
    for (const s of series) expect(actualDts.has(s.dt)).toBe(true);
  });

  test("a sample slightly older than now is excluded (current time between samples)", () => {
    const older = fentry(now - 3600);
    const next = fentry(now + 7200);
    const series = build48HourForecast([older, next], now, 3600);
    expect(series.map((s) => s.dt)).toEqual([next.dt]);
  });

  test("window near the end of available data stops at the last real sample", () => {
    const samples = [2, 4, 6, 8].map((h) => fentry(now + h * 3600));
    const series = build48HourForecast(samples, now, 3600);
    expect(series.length).toBe(4);
    expect(series[series.length - 1].dt).toBe(now + 8 * 3600);
  });

  test("enriched normalized fields + missing POP → null", () => {
    const s = fentry(now + 10800, { temp: 22, humidity: 55, windSpeed: 4, pop: 0.3 });
    const noPop = fentry(now + 21600, { temp: 24, humidity: 60 });
    const series = build48HourForecast([noPop, s], now, 3600);
    const withPop = series.find((x) => x.dt === s.dt);
    expect(withPop.localDate).toBe("2026-08-13");
    // s.dt is UTC 15:00; the +3600s (+1h) offset makes it 16:00 location-local.
    expect(withPop.localTime).toBe("16:00");
    expect(withPop.humidity).toBe(55);
    expect(withPop.dewPoint).toBe(13); // getDewPoint(22, 55) via Magnus formula
    expect(withPop.weatherId).toBe(800);
    expect(series.find((x) => x.dt === noPop.dt).pop).toBeNull();
  });
});

describe("buildHourlyForToday", () => {
  test("returns the current observation plus today's location-date samples", () => {
    const current = currentOf(unixts(2026, 8, 13, 12));
    const todayLater = fentry(unixts(2026, 8, 13, 14), { temp: 26 });
    const tomorrow = fentry(unixts(2026, 8, 14, 4), { temp: 18 });
    const hourly = buildHourlyForToday([todayLater, tomorrow], current, 3600);

    expect(hourly.map((h) => h.dt)).toEqual([current.dt, todayLater.dt]);
    expect(hourly[0].temp).toBe(25);
    expect(hourly[0].pop).toBeNull();
  });
});

describe("buildOpenWeatherPayload — integration", () => {
  const now = Math.floor(Date.UTC(2026, 7, 13, 12) / 1000);

  const makeForecast = () => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push(fentry(now + i * 10800, { temp: 20 + (i % 5), pop: (i % 3) / 10 }));
    }
    return { data: { city: { timezone: BEIJING }, list } };
  };

  test("forecast invariants: no fabricated days, valid 48h window, no NaN", () => {
    const payload = buildOpenWeatherPayload(
      { data: { dt: now, main: { temp: 24 } } },
      makeForecast(),
      { data: { value: 6 } },
      { nowSeconds: now }
    );

    expect(payload.availableDays).toBe(payload.daily.length);
    expect(payload.daily.length).toBeGreaterThan(0);
    expect(payload.daily.length).toBeLessThanOrEqual(7);

    const dates = payload.daily.map((d) => d.date);
    expect(new Set(dates).size).toBe(dates.length); // unique, no clones

    expect(
      payload.daily.every(
        (d) =>
          d.temp.max === null ||
          (!Number.isNaN(d.temp.max) && d.temp.max >= d.temp.min)
      )
    ).toBe(true);
    expect(payload.daily.every((d) => !Number.isNaN(d.temp.min))).toBe(true);
    expect(
      payload.daily.every(
        (d) => d.pop === null || (d.pop >= 0 && d.pop <= 100)
      )
    ).toBe(true);

    for (const point of payload.outlook48h) {
      expect(point.dt).toBeGreaterThanOrEqual(now);
      expect(point.dt).toBeLessThanOrEqual(now + 48 * 3600);
      expect(Number.isNaN(point.temp)).toBe(false);
    }
    expect(payload.outlook24h).toBe(payload.outlook48h);
  });

  test("caller-provided nowSeconds prevents races and filters consistently", () => {
    const payload = buildOpenWeatherPayload(
      { data: { dt: now, main: { temp: 24 } } },
      makeForecast(),
      { data: { value: 6 } },
      { nowSeconds: now }
    );
    for (const point of payload.outlook48h) {
      expect(point.dt).toBeGreaterThanOrEqual(now);
    }
  });
});

describe("buildOpenWeatherPayload — current normalization (FIX #4C)", () => {
  const now = Math.floor(Date.UTC(2026, 7, 13, 12) / 1000);

  const buildCurrent = (over = {}) =>
    buildOpenWeatherPayload(
      {
        data: {
          dt: now,
          main: {
            temp: over.temp,
            feels_like: over.feels_like,
            pressure: over.pressure,
            humidity: over.humidity,
          },
          wind: { speed: over.windSpeed, deg: over.windDeg, gust: over.windGust },
          clouds: over.clouds !== undefined ? { all: over.clouds } : null,
          visibility: over.visibility,
        },
      },
      { data: { city: { timezone: 0 }, list: [] } },
      { data: { value: over.uvi } },
      { nowSeconds: now }
    ).current;

  test("missing numerics normalize to null (no fabrication)", () => {
    const c = buildCurrent({});
    expect(c.temp).toBeNull();
    expect(c.feels_like).toBeNull();
    expect(c.pressure).toBeNull();
    expect(c.humidity).toBeNull();
    expect(c.visibility).toBeNull();
    expect(c.clouds).toBeNull();
    expect(c.uvi).toBeNull();
    expect(c.wind_speed).toBeNull();
  });

  test("numeric strings normalize to numbers (display and math can't diverge)", () => {
    const c = buildCurrent({
      temp: "22",
      feels_like: "24",
      pressure: "1013",
      humidity: "55",
      visibility: "5000",
      clouds: "35",
      uvi: "6",
      windSpeed: "4",
    });
    expect(c.temp).toBe(22);
    expect(c.feels_like).toBe(24);
    expect(c.pressure).toBe(1013);
    expect(c.humidity).toBe(55);
    expect(c.visibility).toBe(5000);
    expect(c.clouds).toBe(35);
    expect(c.uvi).toBe(6);
    expect(c.wind_speed).toBe(4);
  });

  test("humidity range policy: <0 and >100 → null; 0 and 100 preserved", () => {
    expect(buildCurrent({ humidity: -1 }).humidity).toBeNull();
    expect(buildCurrent({ humidity: 101 }).humidity).toBeNull();
    expect(buildCurrent({ humidity: "" }).humidity).toBeNull();
    expect(buildCurrent({ humidity: "   " }).humidity).toBeNull();
    expect(buildCurrent({ humidity: 0 }).humidity).toBe(0);
    expect(buildCurrent({ humidity: 100 }).humidity).toBe(100);
  });

  test("genuine zeros are preserved for every current numeric", () => {
    const c = buildCurrent({
      temp: 0,
      feels_like: 0,
      pressure: 0,
      humidity: 0,
      visibility: 0,
      clouds: 0,
      uvi: 0,
      windSpeed: 0,
    });
    expect(c.temp).toBe(0);
    expect(c.feels_like).toBe(0);
    expect(c.pressure).toBe(0);
    expect(c.humidity).toBe(0);
    expect(c.visibility).toBe(0);
    expect(c.clouds).toBe(0);
    expect(c.uvi).toBe(0);
    expect(c.wind_speed).toBe(0);
  });
});