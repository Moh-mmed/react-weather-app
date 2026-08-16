import {
  calculateUsAqi,
  getUsAqiFromComponents,
  getUsAqiLabel,
  getUsAqiShortLabel,
} from "./getUsAqi";

const algerComponents = {
  co: 90.82,
  no: 0.12,
  no2: 1.63,
  o3: 116.37,
  so2: 0.33,
  pm2_5: 9.19,
  pm10: 28.32,
  nh3: 0.12,
};

describe("calculateUsAqi — missing data", () => {
  test("all pollutants missing → usAqi null, no NaN/Infinity", () => {
    const r = calculateUsAqi({});
    expect(r.usAqi).toBeNull();
    expect(r.category).toBeNull();
    expect(r.dominantPollutant).toBeNull();
    for (const key of Object.keys(r.pollutants)) {
      expect(r.pollutants[key].aqi).toBeNull();
      expect(r.pollutants[key].concentration).toBeNull();
    }
  });

  test("partial pollution data → only present pollutants contribute", () => {
    const r = calculateUsAqi({ pm2_5: 20 });
    expect(r.dominantPollutant).toBe("pm2_5");
    expect(r.pollutants.o3.aqi).toBeNull();
    expect(r.pollutants.no2.aqi).toBeNull();
  });

  test("invalid values (NaN, Infinity, negative, non-numeric) ignored", () => {
    const r = calculateUsAqi({
      pm2_5: Number.NaN,
      pm10: Infinity,
      o3: -5,
      co: "not-a-number",
    });
    expect(r.usAqi).toBeNull();
    expect(r.pollutants.pm2_5.aqi).toBeNull();
    expect(r.pollutants.pm10.aqi).toBeNull();
  });
});

describe("calculateUsAqi — zero / very low pollution", () => {
  test("all zeros → AQI 0 Good", () => {
    const r = calculateUsAqi({
      co: 0,
      no2: 0,
      o3: 0,
      so2: 0,
      pm2_5: 0,
      pm10: 0,
    });
    expect(r.usAqi).toBe(0);
    expect(r.category).toBe("Good");
  });

  test("very low concentrations → Good range", () => {
    const r = calculateUsAqi({ pm2_5: 1.12, pm10: 3.32, o3: 61.89, no2: 1, so2: 1.54 });
    expect(r.usAqi).toBe(30);
    expect(r.category).toBe("Good");
  });
});

describe("calculateUsAqi — PM2.5 ranges", () => {
  test("PM2.5 Good range", () => {
    expect(calculateUsAqi({ pm2_5: 10 }).usAqi).toBe(42);
  });

  test("PM2.5 Moderate range", () => {
    expect(calculateUsAqi({ pm2_5: 20 }).usAqi).toBe(68);
  });

  test("PM2.5 Unhealthy range", () => {
    expect(calculateUsAqi({ pm2_5: 60 }).usAqi).toBe(153);
  });

  test("PM2.5 concentration rounded to nearest 0.1 before breakpoint lookup", () => {
    // 9.19 µg/m³ → rounded to 9.2 → AQI 38
    expect(calculateUsAqi({ pm2_5: 9.19 }).usAqi).toBe(38);
  });
});

describe("calculateUsAqi — PM10", () => {
  test("PM10 in Unhealthy for sensitive groups range", () => {
    expect(calculateUsAqi({ pm10: 200 }).usAqi).toBe(123);
    expect(calculateUsAqi({ pm10: 200 }).dominantPollutant).toBe("pm10");
  });
});

describe("calculateUsAqi — O3", () => {
  test("O3 µg/m³ → ppm conversion (85 µg/m³ ≈ 0.043 ppm → Good)", () => {
    const r = calculateUsAqi({ o3: 85 });
    expect(r.pollutants.o3.aqiUnit).toBe("ppm");
    expect(r.usAqi).toBe(40);
  });

  test("O3 at 116.37 µg/m³ (≈ 0.059 ppm) → Moderate", () => {
    const r = calculateUsAqi({ o3: 116.37 });
    expect(r.usAqi).toBe(64);
    expect(r.category).toBe("Moderate");
  });

  test("O3 does NOT use its raw µg/m³ value against the ppm breakpoints", () => {
    // Old buggy behaviour produced O3 sub-index 212 for this concentration.
    const r = calculateUsAqi({ o3: 116.37 });
    expect(r.pollutants.o3.aqi).toBe(64);
    expect(r.pollutants.o3.aqi).not.toBe(212);
  });
});

describe("calculateUsAqi — multiple pollutants / dominant", () => {
  test("PM2.5 is dominant over a low O3", () => {
    const r = calculateUsAqi({ pm2_5: 60, o3: 85 });
    expect(r.dominantPollutant).toBe("pm2_5");
    expect(r.usAqi).toBe(153);
  });

  test("O3 is dominant over a lower PM2.5", () => {
    const r = calculateUsAqi({ pm2_5: 40, o3: 170 });
    expect(r.dominantPollutant).toBe("o3");
    expect(r.usAqi).toBe(154);
  });

  test("overall AQI is the highest valid sub-index", () => {
    const r = calculateUsAqi({ pm2_5: 60, pm10: 200, o3: 85 });
    const subs = Object.values(r.pollutantSubIndices).filter((v) => v !== null);
    expect(r.usAqi).toBe(Math.max(...subs));
  });
});

describe("calculateUsAqi — breakpoint boundaries", () => {
  test("PM2.5 boundary at exactly 12.0 stays Good (50)", () => {
    expect(calculateUsAqi({ pm2_5: 12.0 }).usAqi).toBe(50);
  });

  test("PM2.5 just above boundary shifts to next band", () => {
    expect(calculateUsAqi({ pm2_5: 12.1 }).usAqi).toBe(51);
    expect(calculateUsAqi({ pm2_5: 35.4 }).usAqi).toBe(100);
    expect(calculateUsAqi({ pm2_5: 35.5 }).usAqi).toBe(101);
  });

  test("AQI just below/above category thresholds at PM2.5 55.4/55.5", () => {
    expect(calculateUsAqi({ pm2_5: 55.4 }).usAqi).toBe(150);
    expect(calculateUsAqi({ pm2_5: 55.5 }).usAqi).toBe(151);
  });

  test("breakpoints above table maximum return null, not NaN", () => {
    const r = calculateUsAqi({ pm2_5: 9999 });
    expect(r.usAqi).toBeNull();
    expect(r.pollutants.pm2_5.aqi).toBeNull();
  });
});

describe("OpenWeather AQI vs US EPA AQI", () => {
  test("OW main.aqi=3 does not become US AQI=3", () => {
    // Algiers fixture: OpenWeather reports its own 1-5 index as 3, while the
    // pollutant concentrations yield a US EPA AQI of 64 (Moderate, dom O3).
    const usAqi = calculateUsAqi(algerComponents);
    expect(usAqi.usAqi).toBe(64);
    expect(usAqi.usAqi).not.toBe(3);
  });
});

describe("AQI category classification", () => {
  test.each([
    [0, "Good"],
    [50, "Good"],
    [51, "Moderate"],
    [100, "Moderate"],
    [101, "Unhealthy for Sensitive Groups"],
    [150, "Unhealthy for Sensitive Groups"],
    [151, "Unhealthy"],
    [200, "Unhealthy"],
    [201, "Very Unhealthy"],
    [300, "Very Unhealthy"],
    [301, "Hazardous"],
    [500, "Hazardous"],
  ])("AQI %i → %s", (aqi, expected) => {
    expect(getUsAqiLabel(aqi, null)).toBe(expected);
  });

  test("unknown for non-finite AQI", () => {
    expect(getUsAqiLabel(null, null)).toBe("Unknown");
    expect(getUsAqiShortLabel(null, null)).toBe("Unknown");
  });

  test("no custom categories invented", () => {
    const known = new Set([
      "Good",
      "Moderate",
      "Unhealthy for Sensitive Groups",
      "Unhealthy",
      "Very Unhealthy",
      "Hazardous",
      "Unknown",
    ]);
    for (const aqi of [0, 50, 51, 100, 101, 150, 151, 200, 201, 300, 301, 400, 500]) {
      expect(known.has(getUsAqiLabel(aqi, null))).toBe(true);
    }
  });
});

describe("getUsAqiFromComponents — UI contract", () => {
  test("returns legacy fields used by the Air Quality cards", () => {
    const ui = getUsAqiFromComponents({ pm2_5: 20 }, null);
    expect(ui.aqi).toBe(68);
    expect(ui.label).toBe("Moderate");
    expect(ui.mainPollutant).toBe("PM2.5");
    expect(ui.markerPercent).toBeCloseTo(22.67);
    expect(ui.dominantPollutant).toBe("pm2_5");
  });

  test("missing all data → aqi null so UI can show unknown", () => {
    const ui = getUsAqiFromComponents({}, null);
    expect(ui.aqi).toBeNull();
    expect(ui.label).toBe("Unknown");
    expect(ui.mainPollutant).toBeNull();
    expect(ui.markerPercent).toBe(0);
  });
});

describe("diagnostic city fixtures (regression, no NaN / no negatives)", () => {
  const cities = {
    "algiers-dz": algerComponents,
    "oran-dz": { co: 95.02, no: 0.08, no2: 1.96, o3: 104.74, so2: 2.27, pm2_5: 8.65, pm10: 16.95, nh3: 0 },
    "istanbul-tr": { co: 123.74, no: 0.19, no2: 3.2, o3: 117.03, so2: 5.17, pm2_5: 8.96, pm10: 10.43, nh3: 1.24 },
    "tokyo-jp": { co: 121.85, no: 0, no2: 15.58, o3: 47.35, so2: 7.37, pm2_5: 4.96, pm10: 7, nh3: 0.01 },
    "doha-qa": { co: 134.78, no: 0, no2: 4.75, o3: 195.99, so2: 14.67, pm2_5: 76.14, pm10: 224.97, nh3: 0 },
    "florida-uy": { co: 84.94, no: 0.22, no2: 1, o3: 61.89, so2: 1.54, pm2_5: 1.12, pm10: 3.32, nh3: 0.2 },
    "beijing-cn": { co: 852.88, no: 59, no2: 21.14, o3: 0, so2: 8.4, pm2_5: 101.28, pm10: 109.06, nh3: 12.19 },
  };

  test.each(Object.keys(cities))("%s produces a finite, non-negative AQI that equals its max sub-index", (name) => {
    const r = calculateUsAqi(cities[name]);
    expect(Number.isNaN(r.usAqi)).toBe(false);
    expect(r.usAqi).toBeGreaterThanOrEqual(0);
    for (const [key, p] of Object.entries(r.pollutants)) {
      expect(Number.isNaN(p.aqi)).toBe(false);
    }
    const subs = Object.values(r.pollutantSubIndices).filter((v) => v !== null);
    if (subs.length) expect(r.usAqi).toBe(Math.max(...subs));
    if (r.dominantPollutant) {
      expect(r.pollutantSubIndices[r.dominantPollutant]).toBe(r.usAqi);
    }
  });

  test("Beijing (zero O3) is dominated by PM2.5", () => {
    const r = calculateUsAqi(cities["beijing-cn"]);
    expect(r.dominantPollutant).toBe("pm2_5");
    expect(r.usAqi).toBe(175);
  });
});