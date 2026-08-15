import {
  getLocationDateKey,
  getLocationHour,
  formatLocationTime,
  toLocationDate,
  getDayLabel,
} from "./weatherTime";

// Deterministic Unix seconds built from UTC calendar values — independent of
// the machine/browser timezone.
const unixts = (year, month, day, hour = 0, minute = 0) =>
  Math.floor(Date.UTC(year, month - 1, day, hour, minute) / 1000);

describe("getLocationDateKey — location-calendar days (browser-tz independent)", () => {
  test("Algiers (UTC+1): UTC 23:30 is next local day", () => {
    expect(getLocationDateKey(unixts(2026, 8, 13, 23, 30), 3600)).toBe("2026-08-14");
    expect(getLocationDateKey(unixts(2026, 8, 13, 22, 30), 3600)).toBe("2026-08-13");
  });

  test("Istanbul (UTC+3): UTC 22:00 is next local day", () => {
    expect(getLocationDateKey(unixts(2026, 8, 13, 22, 0), 10800)).toBe("2026-08-14");
  });

  test("Beijing (UTC+8): UTC 20:00 is next local day, UTC 15:00 is not", () => {
    expect(getLocationDateKey(unixts(2026, 8, 13, 20, 0), 28800)).toBe("2026-08-14");
    expect(getLocationDateKey(unixts(2026, 8, 13, 15, 0), 28800)).toBe("2026-08-13");
  });

  test("negative offset (UTC-5): UTC 05:00 local midnight same day", () => {
    expect(getLocationDateKey(unixts(2026, 8, 13, 5, 0), -18000)).toBe("2026-08-13");
    expect(getLocationDateKey(unixts(2026, 8, 13, 4, 59), -18000)).toBe("2026-08-12");
  });

  test("month boundary crossings respected", () => {
    expect(getLocationDateKey(unixts(2026, 8, 31, 23, 0), 28800)).toBe("2026-09-01");
  });

  test("year boundary crossings respected", () => {
    expect(getLocationDateKey(unixts(2026, 12, 31, 23, 0), 10800)).toBe("2027-01-01");
  });

  test("non-integer hour offsets (e.g. UTC+5:30) work", () => {
    expect(getLocationDateKey(unixts(2026, 8, 13, 18, 0), 19800)).toBe("2026-08-13");
  });

  describe("invalid & boundary inputs (C1)", () => {
    test("null, undefined, empty and whitespace timestamps return null", () => {
      expect(getLocationDateKey(null, 3600)).toBeNull();
      expect(getLocationDateKey(undefined, 3600)).toBeNull();
      expect(getLocationDateKey("", 3600)).toBeNull();
      expect(getLocationDateKey("   ", 3600)).toBeNull();
    });

    test("non-finite numbers return null", () => {
      expect(getLocationDateKey(Number.NaN, 3600)).toBeNull();
      expect(getLocationDateKey(Infinity, 3600)).toBeNull();
      expect(getLocationDateKey(-Infinity, 3600)).toBeNull();
    });

    test("invalid timezone offset returns null", () => {
      expect(getLocationDateKey(123, null)).toBeNull();
      expect(getLocationDateKey(123, undefined)).toBeNull();
      expect(getLocationDateKey(123, "")).toBeNull();
      expect(getLocationDateKey(123, Number.NaN)).toBeNull();
    });

    test("null/undefined/empty offsets no longer coerce to epoch", () => {
      expect(formatLocationTime(null, 3600, "HH:mm")).toBe("--");
      expect(formatLocationTime(undefined, 3600, "HH:mm")).toBe("--");
      expect(formatLocationTime(0, null, "HH:mm")).toBe("--");
      expect(getLocationHour(null, 3600)).toBeNull();
      expect(toLocationDate(null, 3600)).toBeNull();
      expect(formatLocationTime(Infinity, 3600, "HH:mm")).toBe("--");
    });

    test("zero and negative valid timestamps still work", () => {
      expect(getLocationDateKey(0, 3600)).toBe("1970-01-01");
      expect(formatLocationTime(0, 3600, "HH:mm")).toBe("01:00");
      expect(formatLocationTime("-1", 3600, "HH:mm")).toBe("00:59");
      // String zeros are valid numeric input, not "empty".
      expect(getLocationDateKey("0", 3600)).toBe("1970-01-01");
      expect(getLocationDateKey(" 123 ", 3600)).toBe("1970-01-01");
    });
  });
});

describe("browser timezone independence", () => {
  test.each([
    [unixts(2026, 8, 13, 23, 30), 3600],
    [unixts(2026, 8, 13, 22, 0), 10800],
    [unixts(2026, 8, 13, 20, 0), 28800],
    [unixts(2026, 2, 29, 4, 0), -18000], // offset past a leap-day UTC midnight
    [unixts(2026, 12, 31, 23, 30), 14400],
  ])("date key equals the raw UTC-shifted date for ts=%i offset=%i", (ts, offset) => {
    // Same definition the utility must produce, computed WITHOUT any local-time
    // code path — so if the utility ever leaked the browser timezone this would
    // disagree on machines whose local timezone differs.
    const shifted = new Date(ts * 1000 + offset * 1000).toISOString().slice(0, 10);
    expect(getLocationDateKey(ts, offset)).toBe(shifted);
  });
});

describe("getLocationHour", () => {
  test("returns the location-local hour", () => {
    expect(getLocationHour(unixts(2026, 8, 13, 18, 0), 19800)).toBe(23);
    expect(getLocationHour(unixts(2026, 8, 13, 22, 0), 3600)).toBe(23);
    expect(getLocationHour(unixts(2026, 8, 13, 22, 0), 10800)).toBe(1);
    expect(getLocationHour(Number.NaN, 3600)).toBeNull();
  });
});

describe("formatLocationTime", () => {
  test("formats in location-local time", () => {
    expect(formatLocationTime(unixts(2026, 8, 13, 18, 0), 19800, "HH:mm")).toBe("23:30");
    expect(formatLocationTime(unixts(2026, 8, 13, 12, 0), 28800, "HH:mm")).toBe("20:00");
  });

  test("invalid input renders --", () => {
    expect(formatLocationTime(null, 3600, "HH:mm")).toBe("--");
  });
});

describe("toLocationDate", () => {
  test("returns plain wall-clock fields", () => {
    expect(toLocationDate(unixts(2026, 8, 13, 18, 0), 19800)).toEqual({
      year: 2026,
      month: 8,
      day: 13,
      hour: 23,
      minute: 30,
    });
    expect(toLocationDate(1, 3600)).toEqual({
      year: 1970,
      month: 1,
      day: 1,
      hour: 1,
      minute: 0,
    });
  });
});

describe("getDayLabel — location-calendar classification (E2)", () => {
  // Beijing (UTC+8). nowUnix = UTC Aug 13 16:00 = Beijing Aug 14 00:00.
  const nowBeijingMidnight = unixts(2026, 8, 13, 16, 0);
  const BEIJING = 28800;

  test("classifies by the LOCATION calendar, not the browser calendar", () => {
    // Beijing is already Aug 14 while New York (UTC-4) is still Aug 13.
    // A moonrise on Beijing's Aug 14 must be "Today" regardless of browser tz.
    expect(getDayLabel("2026-08-14", nowBeijingMidnight, BEIJING)).toBe("Today");
    expect(getDayLabel("2026-08-15", nowBeijingMidnight, BEIJING)).toBe("Tomorrow");
    expect(getDayLabel("2026-08-13", nowBeijingMidnight, BEIJING)).toBe("Yesterday");
  });

  test("browser ahead of the location still uses the location day", () => {
    // UTC-5 location; nowUnix = UTC Aug 14 02:00 = location Aug 13 21:00.
    // A browser in UTC+10 would already see Aug 14, but the label stays "Today".
    const now = unixts(2026, 8, 14, 2, 0);
    expect(getDayLabel("2026-08-13", now, -18000)).toBe("Today");
    expect(getDayLabel("2026-08-14", now, -18000)).toBe("Tomorrow");
  });

  test("midnight boundary (location has already rolled to the next day)", () => {
    // Location is exactly at its local midnight → new calendar day starts.
    expect(getDayLabel("2026-08-14", nowBeijingMidnight, BEIJING)).toBe("Today");
    expect(getDayLabel("2026-08-13", nowBeijingMidnight, BEIJING)).toBe("Yesterday");
    // One second before local midnight the previous day is still "Today".
    const justBefore = nowBeijingMidnight - 1;
    expect(getDayLabel("2026-08-13", justBefore, BEIJING)).toBe("Today");
  });

  test("other days fall back to a short weekday name", () => {
    // Aug 13 2026 is a Thursday; Aug 20 is exactly 7 days later → same weekday.
    const now = unixts(2026, 8, 13, 12, 0);
    expect(getDayLabel("2026-08-20", now, 0)).toBe(
      new Date(Date.UTC(2026, 7, 20)).toLocaleDateString(undefined, { weekday: "short" }),
    );
  });

  test("null / invalid input returns null", () => {
    expect(getDayLabel(null, nowBeijingMidnight, BEIJING)).toBeNull();
    expect(getDayLabel(undefined, nowBeijingMidnight, BEIJING)).toBeNull();
    expect(getDayLabel("", nowBeijingMidnight, BEIJING)).toBeNull();
    expect(getDayLabel("2026-08-14", null, BEIJING)).toBeNull();
    expect(getDayLabel("2026-08-14", nowBeijingMidnight, null)).toBeNull();
  });
});