import { getNextSunrise, getTimeUntilSunrise } from "./sunArcUtils";

const sunrise = 1_000_000_000; // today's sunrise

describe("getNextSunrise — actual next-day sunrise (E1)", () => {
  test("returns today's sunrise when it has not happened yet", () => {
    expect(getNextSunrise(sunrise, sunrise - 3600, 1_999_000_000)).toBe(sunrise);
  });

  test("returns a supplied next-day sunrise unchanged after today's has passed", () => {
    const dt = sunrise + 3600;
    const next = sunrise + 82_800; // e.g. 23h later across an autumn DST shift
    expect(getNextSunrise(sunrise, dt, next)).toBe(next);
  });

  test("respects changing day length (next sunrise not exactly +24h)", () => {
    const dt = sunrise + 3600;
    // A 15h10m solar day: the real next sunrise is 90 000s away, not 86 400s.
    const next = sunrise + 90_000;
    expect(getNextSunrise(sunrise, dt, next)).toBe(90_000 + sunrise);
    expect(getNextSunrise(sunrise, dt, next)).not.toBe(sunrise + 86_400);
  });

  test("invalid inputs return today's sunrise as a safe fallback", () => {
    expect(getNextSunrise(null, 123, 999)).toBe(null);
    expect(getNextSunrise(undefined, 123, 999)).toBe(undefined);
    expect(getNextSunrise(sunrise, Number.NaN, 999)).toBe(sunrise);
  });

  test("a non-finite or non-increasing nextSunrise is ignored (legacy +24h fallback)", () => {
    expect(getNextSunrise(sunrise, sunrise + 1, Number.NaN)).toBe(sunrise + 86_400);
    expect(getNextSunrise(sunrise, sunrise + 1, undefined)).toBe(sunrise + 86_400);
    expect(getNextSunrise(sunrise, sunrise + 1, sunrise - 100)).toBe(sunrise + 86_400);
  });
});

describe("getTimeUntilSunrise", () => {
  test("delegates to the provided next-day sunrise", () => {
    const dt = sunrise + 3600;
    const next = sunrise + 90_000;
    expect(getTimeUntilSunrise(sunrise, dt, next)).toBe(90_000 - 3600);
  });

  test("returns 0 once the passed sunrise is in the past (legacy fallback)", () => {
    // No next-day value: the legacy +24h approximation still yields a future time.
    expect(getTimeUntilSunrise(sunrise, sunrise + 86_400 * 2, undefined)).toBe(0);
  });

  test("invalid input returns null", () => {
    expect(getTimeUntilSunrise(null, 123)).toBeNull();
  });
});