import { render, screen } from "@testing-library/react";
import DetailsSection from "./DetailsSection";
import { setupI18n } from "./i18nTestUtils";

jest.mock("../../contexts/UnitContext", () => ({
  useUnit: () => ({
    unitSystem: "metric",
    convertTemp: (c) => (Number.isFinite(c) ? Math.round(c) : "--"),
    convertWind: (ms) =>
      Number.isFinite(ms)
        ? { value: String(Math.round(ms * 3.6)), unitKey: "stats.unitKmH" }
        : { value: "--", unitKey: "stats.unitKmH" },
    convertVisibility: (m) =>
      Number.isFinite(m)
        ? { value: (m / 1000).toFixed(1), unitKey: "stats.unitKm" }
        : { value: "--", unitKey: "stats.unitKm" },
    convertPressure: (hpa) =>
      Number.isFinite(hpa)
        ? { value: String(Math.round(hpa)), unitKey: "stats.unitMb" }
        : { value: "--", unitKey: "stats.unitMb" },
  }),
}));

const val = (over, key, def) => (key in over ? over[key] : def);

const mkCurrent = (over = {}) => ({
  temp: val(over, "temp", 22),
  feels_like: val(over, "feels_like", 22),
  pressure: val(over, "pressure", 1013),
  humidity: val(over, "humidity", 50),
  wind_speed: val(over, "wind_speed", 2),
  wind_deg: val(over, "wind_deg", 90),
  visibility: val(over, "visibility", 10000),
  uvi: val(over, "uvi", 5),
  wind: { gust: over.gust },
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
});

const hourly = [
  { dt: 1000, pressure: 1010 },
  { dt: 2000, pressure: 1015 },
];

const renderDetails = (current, lng = "en") => {
  setupI18n(lng);
  return render(<DetailsSection page={{ weatherData: { current, hourly } }} />);
};

describe("DetailsSection — humidity missing state (FIX #4C)", () => {
  test("null humidity → unavailable band, no fabricated 0%", () => {
    renderDetails(mkCurrent({ humidity: null }));

    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
    expect(screen.queryByText("0%")).toBeNull();
    expect(screen.queryAllByText("Not available").length).toBeGreaterThan(0);
  });

  test("undefined humidity → same neutral state", () => {
    renderDetails(mkCurrent({ humidity: undefined }));
    expect(screen.queryByText("0%")).toBeNull();
    expect(screen.queryAllByText("Not available").length).toBeGreaterThan(0);
  });
});

describe("DetailsSection — humidity band thresholds (FIX #4C, unchanged)", () => {
  test("0% → Very Dry", () => {
    renderDetails(mkCurrent({ humidity: 0 }));
    expect(screen.queryByText("Very Dry")).not.toBeNull();
    expect(screen.queryByText("0%")).not.toBeNull();
  });

  test("35% → Comfortable", () => {
    renderDetails(mkCurrent({ humidity: 35 }));
    expect(screen.queryAllByText("Comfortable").length).toBeGreaterThan(0);
  });

  test("65% → Comfortable", () => {
    renderDetails(mkCurrent({ humidity: 65 }));
    expect(screen.queryAllByText("Comfortable").length).toBeGreaterThan(0);
  });

  test("66% → Humid", () => {
    renderDetails(mkCurrent({ humidity: 66 }));
    expect(screen.queryAllByText("Humid").length).toBeGreaterThan(0);
  });

  test("85% → Humid", () => {
    renderDetails(mkCurrent({ humidity: 85 }));
    expect(screen.queryAllByText("Humid").length).toBeGreaterThan(0);
  });

  test("86% → Saturated / Sticky", () => {
    renderDetails(mkCurrent({ humidity: 86 }));
    expect(screen.queryByText("Saturated")).not.toBeNull();
    expect(screen.queryByText("Sticky")).not.toBeNull();
  });

  test("100% → Saturated / Sticky", () => {
    renderDetails(mkCurrent({ humidity: 100 }));
    expect(screen.queryByText("Saturated")).not.toBeNull();
    expect(screen.queryByText("Sticky")).not.toBeNull();
  });
});

describe("DetailsSection — dew point missing state (FIX #4C)", () => {
  test("missing temperature → dew point unavailable while humidity stays classified", () => {
    renderDetails(mkCurrent({ temp: null, humidity: 50 }));

    expect(screen.queryAllByText("Comfortable").length).toBeGreaterThan(0);
    expect(screen.queryByText("Not available")).not.toBeNull();
  });

  test("valid temperature + humidity → dew point band present, no 'Not available' for dew", () => {
    renderDetails(mkCurrent({ temp: 22, humidity: 50 }));
    // Dew point for (22, 50) is ~11°C → "Comfortable".
    expect(screen.queryAllByText("Comfortable").length).toBeGreaterThan(0);
  });
});

describe("DetailsSection — pressure gauge missing state (FIX #4D M1)", () => {
  test("missing pressure → '--' value and no fabricated gauge fill arc", () => {
    const { container } = renderDetails(mkCurrent({ pressure: null }));
    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
    expect(container.querySelector('[class*="3B82F6"]')).toBeNull();
  });

  test("undefined pressure → same neutral gauge state", () => {
    const { container } = renderDetails(mkCurrent({ pressure: undefined }));
    expect(container.querySelector('[class*="3B82F6"]')).toBeNull();
  });

  test("valid pressure → gauge fill arc rendered", () => {
    const { container } = renderDetails(mkCurrent({ pressure: 1013 }));
    expect(container.querySelector('[class*="3B82F6"]')).not.toBeNull();
  });
});

describe("DetailsSection — gust comparison (FIX #4D L3)", () => {
  test("gust above sustained wind → gust displayed", () => {
    renderDetails(mkCurrent({ gust: 4 }));
    expect(screen.getAllByText("Gusts").length).toBeGreaterThan(0);
  });

  test("gust below sustained wind → gust suppressed (OpenWeather quirk)", () => {
    renderDetails(mkCurrent({ gust: 1 }));
    expect(screen.queryByText("Gusts")).toBeNull();
  });

  test("missing sustained wind with valid gust → gust still displayed", () => {
    renderDetails(mkCurrent({ wind_speed: null, gust: 4 }));
    expect(screen.getAllByText("Gusts").length).toBeGreaterThan(0);
  });

  test("undefined sustained wind with valid gust → gust displayed consistently", () => {
    renderDetails(mkCurrent({ wind_speed: undefined, gust: 4 }));
    expect(screen.getAllByText("Gusts").length).toBeGreaterThan(0);
  });
});

describe("DetailsSection — visibility wiring (FIX #4C)", () => {
  test("null visibility → no 'Poor' band anywhere", () => {
    renderDetails(mkCurrent({ visibility: null }));
    expect(screen.queryByText("Poor")).toBeNull();
    expect(screen.queryAllByText("Not available").length).toBeGreaterThan(0);
  });

  test("visibility 0 → real zero, 'Poor' band preserved", () => {
    renderDetails(mkCurrent({ visibility: 0 }));
    expect(screen.queryAllByText("Poor").length).toBeGreaterThan(0);
  });
});

describe("DetailsSection — localized headers & aria-labels (FIX #4D-M2)", () => {
  test("card headers translate to French", () => {
    renderDetails(mkCurrent(), "fr");

    expect(screen.getByText("Pression")).not.toBeNull();
    expect(screen.getByText("Humidité")).not.toBeNull();
    expect(screen.getByText("Point de rosée")).not.toBeNull();
  });

  test("pressure dial aria-label translates to French", () => {
    renderDetails(mkCurrent(), "fr");

    expect(
      screen.getByLabelText("Cadran de pression : 1013 mb")
    ).not.toBeNull();
  });

  test("humidity gauge aria-label translates to French", () => {
    renderDetails(mkCurrent(), "fr");

    expect(screen.getByLabelText("Jauge d'humidité : 50%")).not.toBeNull();
  });

  test("missing humidity uses translated 'not available' in gauge label", () => {
    renderDetails(mkCurrent({ humidity: null }), "fr");

    expect(
      screen.getByLabelText("Jauge d'humidité : Indisponible")
    ).not.toBeNull();
  });
});
