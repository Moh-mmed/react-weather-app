import { getDewPoint } from "./getDewPoint";

describe("getDewPoint — missing temperature", () => {
  test("null temperature → null", () => {
    expect(getDewPoint(null, 50)).toBeNull();
  });

  test("undefined temperature → null", () => {
    expect(getDewPoint(undefined, 50)).toBeNull();
  });

  test("empty-string temperature → null", () => {
    expect(getDewPoint("", 50)).toBeNull();
  });

  test("whitespace-only temperature → null", () => {
    expect(getDewPoint("   ", 50)).toBeNull();
  });
});

describe("getDewPoint — invalid temperature", () => {
  test("NaN temperature → null", () => {
    expect(getDewPoint(NaN, 50)).toBeNull();
  });

  test("Infinity temperature → null", () => {
    expect(getDewPoint(Infinity, 50)).toBeNull();
  });

  test("-Infinity temperature → null", () => {
    expect(getDewPoint(-Infinity, 50)).toBeNull();
  });
});

describe("getDewPoint — missing humidity", () => {
  test("null humidity → null", () => {
    expect(getDewPoint(22, null)).toBeNull();
  });

  test("undefined humidity → null", () => {
    expect(getDewPoint(22, undefined)).toBeNull();
  });

  test("empty-string humidity → null", () => {
    expect(getDewPoint(22, "")).toBeNull();
  });

  test("whitespace-only humidity → null", () => {
    expect(getDewPoint(22, "   ")).toBeNull();
  });
});

describe("getDewPoint — invalid humidity", () => {
  test("NaN humidity → null", () => {
    expect(getDewPoint(22, NaN)).toBeNull();
  });

  test("Infinity humidity → null", () => {
    expect(getDewPoint(22, Infinity)).toBeNull();
  });

  test("-Infinity humidity → null", () => {
    expect(getDewPoint(22, -Infinity)).toBeNull();
  });

  test("0 % humidity is mathematically undefined → null", () => {
    expect(getDewPoint(22, 0)).toBeNull();
  });

  test("negative humidity → null", () => {
    expect(getDewPoint(22, -5)).toBeNull();
  });
});

describe("getDewPoint — valid boundary/data cases", () => {
  test("0°C is valid (missing inputs must not become 0)", () => {
    expect(getDewPoint(0, 50)).toBe(-9);
  });

  test("100 % humidity → dew point equals air temperature", () => {
    expect(getDewPoint(25, 100)).toBe(25);
  });

  test("negative temperature is valid", () => {
    expect(getDewPoint(-5, 80)).toBe(-8);
  });

  test("very low humidity stays finite and negative", () => {
    expect(getDewPoint(25, 1)).toBe(-35);
  });

  test("reference value 22°C / 55 % → 13", () => {
    expect(getDewPoint(22, 55)).toBe(13);
  });

  test("numeric strings are accepted", () => {
    expect(getDewPoint("22", "55")).toBe(13);
  });

  test("numeric strings with surrounding whitespace are accepted", () => {
    expect(getDewPoint(" 22 ", " 55 ")).toBe(13);
  });
});

describe("getDewPoint — no NaN / Infinity leakage", () => {
  test("valid finite inputs produce a finite rounded value", () => {
    const inputs = [
      [0, 50],
      [-5, 80],
      [25, 100],
      [25, 1],
      [22, 55],
      [37, 90],
      [-20, 40],
    ];
    for (const [temp, rh] of inputs) {
      const result = getDewPoint(temp, rh);
      expect(Number.isFinite(result)).toBe(true);
    }
  });
});

describe("getDewPoint — regression: null never fabricates a dew point", () => {
  test("getDewPoint(null, 50) must never return a numeric value", () => {
    expect(getDewPoint(null, 50)).toBeNull();
  });

  test("empty / whitespace strings are the same coercion class as null", () => {
    expect(getDewPoint("", 50)).toBeNull();
    expect(getDewPoint("   ", 50)).toBeNull();
  });
});
