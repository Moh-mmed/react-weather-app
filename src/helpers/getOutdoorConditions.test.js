import { getOutdoorConditions } from "./getOutdoorConditions";

describe("getOutdoorConditions", () => {
  test("Test 1 — Reference Scenario ('Good overall')", () => {
    const result = getOutdoorConditions({
      uvi: 0,                  // Low (100)
      visibilityMeters: 10000, // Excellent (100)
      windSpeedMs: 5.3,        // Moderate Breeze (55)
      humidity: 19,            // Dry band (55)
      aqiUs: 42,               // Good (100)
    });

    expect(result.score).toBe(82);
    expect(result.level).toBe("good-overall");
    expect(result.title).toBe("Good overall");

    // Description must contain positive clause (visibility or UV) and dry-air caution
    expect(result.description.toLowerCase()).toMatch(/clear visibility|low uv/);
    expect(result.description.toLowerCase()).toContain("dry");

    // Highlights includes a "warn" entry for dry air and at least one "good" entry
    expect(result.highlights.length).toBeGreaterThan(0);
    expect(result.highlights.length).toBeLessThanOrEqual(3);

    const warnEntry = result.highlights.find((h) => h.type === "warn");
    const goodEntry = result.highlights.find((h) => h.type === "good");

    expect(warnEntry).toBeDefined();
    expect(goodEntry).toBeDefined();
    expect(warnEntry.label.toLowerCase()).toContain("dry");
  });

  test("Test 2 — 'Fair conditions'", () => {
    const result = getOutdoorConditions({
      uvi: 7,                  // High (55)
      visibilityMeters: 5000,  // Moderate (45)
      windSpeedMs: 7,          // Moderate Breeze (55)
      humidity: 50,            // Comfortable (100)
      aqiUs: 120,              // USG (50)
    });

    // Score: (55 + 45 + 55 + 100 + 50) / 5 = 61
    expect(result.score).toBe(61);
    expect(result.level).toBe("fair");
    expect(result.title).toBe("Fair conditions");
    expect(result.description).toBeTruthy();
    expect(result.description.toLowerCase()).toContain("comfortable humidity");
    expect(result.highlights.length).toBeLessThanOrEqual(3);
  });

  test("Test 3 — 'Poor conditions'", () => {
    const result = getOutdoorConditions({
      uvi: 12,                 // Extreme (10)
      visibilityMeters: 1500,  // Poor (15)
      windSpeedMs: 12,         // Strong wind (25)
      humidity: 90,            // Saturated (35)
      aqiUs: 180,              // Unhealthy (25)
    });

    // Score: (10 + 15 + 25 + 35 + 25) / 5 = 22
    expect(result.score).toBe(22);
    expect(result.level).toBe("poor");
    expect(result.title).toBe("Poor conditions");

    // Cautions-only sentence pattern (no positive clause)
    expect(result.description).toMatch(/make outdoor activity less comfortable/i);
    expect(result.highlights.length).toBeLessThanOrEqual(3);
    expect(result.highlights.every((h) => h.type === "warn")).toBe(true);
  });

  test("Highlights length never exceeds 3 when all factors are good or bad", () => {
    const allGood = getOutdoorConditions({
      uvi: 0,
      visibilityMeters: 10000,
      windSpeedMs: 0.5,
      humidity: 50,
      aqiUs: 10,
    });
    expect(allGood.score).toBe(100);
    expect(allGood.level).toBe("good");
    expect(allGood.title).toBe("Good conditions");
    expect(allGood.highlights.length).toBeLessThanOrEqual(3);

    const allBad = getOutdoorConditions({
      uvi: 12,
      visibilityMeters: 1000,
      windSpeedMs: 15,
      humidity: 90,
      aqiUs: 250,
    });
    expect(allBad.highlights.length).toBeLessThanOrEqual(3);
  });

  test("Does not throw on missing/non-finite inputs and returns sane fallback", () => {
    expect(() => getOutdoorConditions()).not.toThrow();
    expect(() => getOutdoorConditions({})).not.toThrow();
    expect(() => getOutdoorConditions(null)).not.toThrow();
    expect(() => getOutdoorConditions({ uvi: NaN, humidity: undefined })).not.toThrow();

    const fallback = getOutdoorConditions({});
    expect(fallback.level).toBe("fair");
    expect(Array.isArray(fallback.highlights)).toBe(true);
  });
});
