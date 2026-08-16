import { render, screen } from "@testing-library/react";
import HeroPanel, { heroIsDay } from "./HeroPanel";
import { setupI18n } from "./i18nTestUtils";

// Sunrise 06:00, sunset 18:00, same local clock domain (Unix seconds).
const SUNRISE = 1_000_000_000;
const SUNSET = 1_000_000_000 + 12 * 3600;

describe("heroIsDay — live-clock day/night (D2)", () => {
  test("currentTime during daytime => true", () => {
    expect(heroIsDay(SUNRISE + 3 * 3600, SUNRISE, SUNSET, false)).toBe(true);
  });

  test("currentTime after sunset => false", () => {
    expect(heroIsDay(SUNSET + 3600, SUNRISE, SUNSET, false)).toBe(false);
  });

  test("currentTime before sunrise => false", () => {
    expect(heroIsDay(SUNRISE - 3600, SUNRISE, SUNSET, false)).toBe(false);
  });

  test("currentTime unavailable => falls back to the observation dt", () => {
    // When currentTime is not provided, the component passes current.dt here.
    // A finite observation dt still produces a time-based result.
    expect(heroIsDay(SUNRISE + 5 * 3600, SUNRISE, SUNSET, true)).toBe(true);
    expect(heroIsDay(SUNSET + 5 * 3600, SUNRISE, SUNSET, true)).toBe(false);
  });

  test("missing clock AND missing bounds => weather-icon suffix decides", () => {
    expect(heroIsDay(undefined, undefined, undefined, false)).toBe(true);
    expect(heroIsDay(undefined, undefined, undefined, true)).toBe(false);
  });

  test("exact sunrise is day, exact sunset is night (open [sunrise, sunset))", () => {
    expect(heroIsDay(SUNRISE, SUNRISE, SUNSET, false)).toBe(true);
    expect(heroIsDay(SUNSET, SUNRISE, SUNSET, false)).toBe(false);
  });
});

describe("HeroPanel — late-night high/low semantics (ISSUE #2)", () => {
  const mockWeatherData = (maxTemp) => ({
    current: {
      temp: 28,
      feels_like: 29,
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01n" }],
      sunrise: SUNRISE,
      sunset: SUNSET,
      dt: SUNSET + 3600,
    },
    daily: [
      {
        date: "2026-08-13",
        temp: { max: maxTemp, min: 21 },
        isHighIncomplete: maxTemp === null,
      },
    ],
  });

  test("late-night case: high is null => displays High --° and Low 21°", () => {
    setupI18n("en");
    render(
      <HeroPanel
        weatherData={mockWeatherData(null)}
        currentTime={SUNSET + 3600}
      />
    );

    expect(screen.getByText(/High/)).toBeDefined();
    expect(screen.getByText(/--°/)).toBeDefined();
    expect(screen.getByText(/21°/)).toBeDefined();
  });

  test("daytime case: high is 34 => displays High 34° and Low 21°", () => {
    setupI18n("en");
    render(
      <HeroPanel
        weatherData={mockWeatherData(34)}
        currentTime={SUNRISE + 3600}
      />
    );

    expect(screen.getByText(/High/)).toBeDefined();
    expect(screen.getByText(/34°/)).toBeDefined();
    expect(screen.getByText(/21°/)).toBeDefined();
  });
});
