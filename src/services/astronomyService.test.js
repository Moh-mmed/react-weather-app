import {
  getMoonPhaseName,
  getMoonIllumination,
  getNextFullMoon,
  getNextNewMoon,
  parseTimeString,
  formatDate,
  pickMoonDay,
} from "./astronomyService";

describe("getMoonPhaseName", () => {
  const cases = [
    [0.0, "New Moon"],
    [0.02, "New Moon"],
    [0.03, "Waxing Crescent"],
    [0.21, "Waxing Crescent"],
    [0.22, "First Quarter"],
    [0.27, "First Quarter"],
    [0.28, "Waxing Gibbous"],
    [0.46, "Waxing Gibbous"],
    [0.48, "Full Moon"],
    [0.52, "Full Moon"],
    [0.53, "Waning Gibbous"],
    [0.71, "Waning Gibbous"],
    [0.72, "Last Quarter"],
    [0.77, "Last Quarter"],
    [0.78, "Waning Crescent"],
    [0.96, "Waning Crescent"],
    [0.98, "New Moon"],
    [1.0, "New Moon"],
  ];

  it.each(cases)("maps moonphase %p to %s", (phase, name) => {
    expect(getMoonPhaseName(phase)).toBe(name);
  });
});

describe("getMoonIllumination", () => {
  it("returns the expected percentages for the key phases", () => {
    expect(getMoonIllumination(0.0)).toBe(0);
    expect(getMoonIllumination(0.25)).toBe(50);
    expect(getMoonIllumination(0.5)).toBe(100);
    expect(getMoonIllumination(0.75)).toBe(50);
    expect(getMoonIllumination(1.0)).toBe(0);
    expect(getMoonIllumination(0.8)).toBe(35);
  });

  it("is consistent with the lunar-cycle formula", () => {
    for (let i = 0; i <= 100; i += 5) {
      const f = i / 100;
      const expected = Math.round(((1 - Math.cos(f * 2 * Math.PI)) / 2) * 100);
      expect(getMoonIllumination(f)).toBe(expected);
    }
  });
});

describe("getNextFullMoon", () => {
  it("returns Tonight when the full moon is within a day", () => {
    expect(getNextFullMoon(0.49)).toBe("Tonight");
  });

  it("counts days until the next full moon", () => {
    expect(getNextFullMoon(0.25)).toBe("7 days");
    expect(getNextFullMoon(0.75)).toBe("22 days");
  });

  it("returns a full synodic month at the exact full moon", () => {
    expect(getNextFullMoon(0.5)).toBe("30 days");
  });
});

describe("getNextNewMoon", () => {
  it("returns a full synodic month at the new moon", () => {
    expect(getNextNewMoon(0)).toBe("30 days");
  });

  it("counts days until the next new moon", () => {
    expect(getNextNewMoon(0.5)).toBe("15 days");
    expect(getNextNewMoon(0.75)).toBe("7 days");
  });
});

describe("parseTimeString", () => {
  it("formats 24-hour strings with a leading zero", () => {
    expect(parseTimeString("5:30")).toBe("05:30");
    expect(parseTimeString("14:05")).toBe("14:05");
  });

  it("formats 12-hour strings with AM/PM", () => {
    expect(parseTimeString("5:30", true)).toBe("5:30 AM");
    expect(parseTimeString("14:05", true)).toBe("2:05 PM");
    expect(parseTimeString("00:00", true)).toBe("12:00 AM");
    expect(parseTimeString("12:00", true)).toBe("12:00 PM");
  });

  it("returns null for missing or malformed input", () => {
    expect(parseTimeString(null)).toBe(null);
    expect(parseTimeString(undefined)).toBe(null);
    expect(parseTimeString("")).toBe(null);
    expect(parseTimeString("foo")).toBe(null);
    expect(parseTimeString("25:99")).toBe("25:99");
  });
});

describe("formatDate", () => {
  it("formats dates as YYYY-MM-DD with zero padding", () => {
    expect(formatDate(new Date(2026, 7, 7))).toBe("2026-08-07");
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("pickMoonDay", () => {
  const days = [
    { datetime: "2026-08-06", moonrise: null, moonset: "2:55 PM" },
    { datetime: "2026-08-07", moonrise: null, moonset: "3:41 PM" },
    { datetime: "2026-08-08", moonrise: "12:40 AM", moonset: null },
  ];

  it("uses today when it has the value", () => {
    expect(pickMoonDay(days, 0, "moonset").datetime).toBe("2026-08-06");
  });

  it("falls forward to the next day with a value", () => {
    expect(pickMoonDay(days, 1, "moonrise").datetime).toBe("2026-08-08");
  });

  it("falls back to the previous day with a value", () => {
    expect(pickMoonDay(days, 2, "moonset").datetime).toBe("2026-08-07");
  });

  it("returns null when no day has the value", () => {
    const noMoon = days.map((day) => ({ ...day, moonrise: null }));
    expect(pickMoonDay(noMoon, 0, "moonrise")).toBe(null);
  });

  it("handles an out-of-range todayIndex", () => {
    expect(pickMoonDay(days, 99, "moonrise").datetime).toBe("2026-08-08");
  });
});
