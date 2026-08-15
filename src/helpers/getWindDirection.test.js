import {
  getWindDirectionAbbr,
  getWindDirectionCardinal,
  getWindDirectionFull,
} from "./getWindDirection";

describe("getWindDirection — valid degrees", () => {
  test("cardinal points", () => {
    expect(getWindDirectionAbbr(0)).toBe("N");
    expect(getWindDirectionAbbr(90)).toBe("E");
    expect(getWindDirectionAbbr(180)).toBe("S");
    expect(getWindDirectionAbbr(270)).toBe("W");
  });

  test("16-point boundaries", () => {
    expect(getWindDirectionAbbr(11)).toBe("N");
    expect(getWindDirectionAbbr(12)).toBe("NNE");
    expect(getWindDirectionAbbr(56)).toBe("NE");
    expect(getWindDirectionAbbr(57)).toBe("ENE");
  });

  test("360° wraps to North", () => {
    expect(getWindDirectionAbbr(360)).toBe("N");
  });

  test("negative degrees wrap via modulo to the correct point", () => {
    expect(getWindDirectionAbbr(-90)).toBe("W"); // -90° ≡ 270°
    expect(getWindDirectionAbbr(-180)).toBe("S"); // -180° ≡ 180°
    expect(getWindDirectionAbbr(-270)).toBe("E"); // -270° ≡ 90°
  });

  test("numeric strings remain supported", () => {
    expect(getWindDirectionAbbr("90")).toBe("E");
    expect(getWindDirectionAbbr("0")).toBe("N");
  });

  test("full name and cardinal helpers follow the abbreviation", () => {
    expect(getWindDirectionFull(0)).toBe("North");
    expect(getWindDirectionCardinal(45)).toBe("E"); // NE belongs to the E quadrant
    expect(getWindDirectionCardinal(135)).toBe("S");
  });
});

describe("getWindDirection — missing/invalid input", () => {
  test("null is missing, not North", () => {
    expect(getWindDirectionAbbr(null)).toBe("--");
    expect(getWindDirectionCardinal(null)).toBe("--");
    expect(getWindDirectionFull(null)).toBe("Unknown wind");
  });

  test("undefined is missing", () => {
    expect(getWindDirectionAbbr(undefined)).toBe("--");
    expect(getWindDirectionCardinal(undefined)).toBe("--");
    expect(getWindDirectionFull(undefined)).toBe("Unknown wind");
  });

  test("empty string is missing", () => {
    expect(getWindDirectionAbbr("")).toBe("--");
    expect(getWindDirectionCardinal("")).toBe("--");
  });

  test("whitespace-only string is missing", () => {
    expect(getWindDirectionAbbr("   ")).toBe("--");
    expect(getWindDirectionCardinal("   ")).toBe("--");
  });

  test("NaN and non-finite numbers are missing", () => {
    expect(getWindDirectionAbbr(NaN)).toBe("--");
    expect(getWindDirectionAbbr(Infinity)).toBe("--");
    expect(getWindDirectionAbbr(-Infinity)).toBe("--");
  });

  test("getWindDirectionAbbr passes a translation through for valid points", () => {
    const t = (key) => (key === "windDirections.N" ? "Nord" : key);
    expect(getWindDirectionAbbr(0, t)).toBe("Nord");
  });
});
