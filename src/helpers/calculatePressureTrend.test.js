import {
  calculatePressureTrend,
  PRESSURE_TREND_THRESHOLD_HPA,
} from "./calculatePressureTrend";

const sample = (dt, pressure) => ({ dt, pressure });

describe("calculatePressureTrend", () => {
  test("correct rising: newest − oldest is positive and exceeds the threshold", () => {
    const { direction, difference } = calculatePressureTrend([
      sample(0, 1010),
      sample(10800, 1012),
      sample(21600, 1015),
    ]);
    expect(direction).toBe("rising");
    expect(difference).toBe(5);
  });

  test("correct falling: newest − oldest is negative and below −threshold", () => {
    const { direction, difference } = calculatePressureTrend([
      sample(0, 1015),
      sample(10800, 1012),
      sample(21600, 1010),
    ]);
    expect(direction).toBe("falling");
    expect(difference).toBe(-5);
  });

  test("stable: change stays within the existing threshold", () => {
    const { direction, difference } = calculatePressureTrend([
      sample(0, 1013),
      sample(10800, 1013.6),
      sample(21600, 1014),
    ]);
    expect(direction).toBe("stable");
    expect(difference).toBe(1);
  });

  test("exact threshold boundary is stable (change not > threshold)", () => {
    const { direction } = calculatePressureTrend([
      sample(0, 1013),
      sample(10800, 1013 + PRESSURE_TREND_THRESHOLD_HPA),
    ]);
    expect(direction).toBe("stable");
  });

  test("sorts chronologically and compares oldest → newest", () => {
    const { direction, difference, samples } = calculatePressureTrend([
      sample(14 * 3600, 1015),
      sample(8 * 3600, 1010),
      sample(11 * 3600, 1012),
    ]);
    expect(samples[0].pressure).toBe(1010); // oldest
    expect(samples[samples.length - 1].pressure).toBe(1015); // newest
    expect(difference).toBe(5);
    expect(direction).toBe("rising");
  });

  test("ignores non-finite pressures (null/undefined/NaN/Infinity/empty string)", () => {
    const { direction, difference, samples } = calculatePressureTrend([
      sample(0, 1010),
      sample(1800, null),
      sample(3600, undefined),
      sample(5400, NaN),
      sample(7200, Infinity),
      sample(9000, -Infinity),
      sample(10800, ""),
      sample(12600, 1015),
    ]);
    expect(samples.map((s) => s.pressure)).toEqual([1010, 1015]);
    expect(difference).toBe(5);
    expect(direction).toBe("rising");
  });

  test("physically implausible but finite pressure 0 remains technically valid", () => {
    const { direction, difference, samples } = calculatePressureTrend([
      sample(0, 0),
      sample(10800, 3),
    ]);
    expect(samples.length).toBe(2);
    expect(difference).toBe(3);
    expect(direction).toBe("rising");
  });

  test("0 valid samples → direction and difference are null (no fabrication)", () => {
    const { direction, difference, samples } = calculatePressureTrend([
      sample(0, null),
      sample(1800, NaN),
    ]);
    expect(direction).toBeNull();
    expect(difference).toBeNull();
    expect(samples).toEqual([]);
  });

  test("1 valid sample → direction and difference are null", () => {
    const { direction, difference, samples } = calculatePressureTrend([
      sample(0, 1010),
      sample(1800, null),
    ]);
    expect(direction).toBeNull();
    expect(difference).toBeNull();
    expect(samples.map((s) => s.pressure)).toEqual([1010]);
  });

  test("sparkline samples are oldest → newest (never reversed)", () => {
    const { samples } = calculatePressureTrend([
      sample(21 * 3600, 1011),
      sample(6 * 3600, 1016),
      sample(12 * 3600, 1014),
    ]);
    expect(samples.map((s) => s.dt)).toEqual(
      [...samples.map((s) => s.dt)].sort((a, b) => a - b)
    );
    expect(samples[0].dt).toBe(6 * 3600); // oldest first
    expect(samples[samples.length - 1].dt).toBe(21 * 3600); // newest last
  });

  test("labelsable window: samples keep their real timestamps (no implied 24h)", () => {
    const { samples } = calculatePressureTrend([
      sample(8 * 3600, 1010),
      sample(14 * 3600, 1014),
    ]);
    expect(samples[0].dt).toBe(8 * 3600);
    expect(samples[1].dt).toBe(14 * 3600);
  });

  test("empty / undefined input → no trend", () => {
    expect(calculatePressureTrend().direction).toBeNull();
    expect(calculatePressureTrend([]).direction).toBeNull();
  });
});