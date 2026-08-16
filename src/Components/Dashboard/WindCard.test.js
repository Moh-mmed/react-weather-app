import { render, screen } from "@testing-library/react";
import WindCard from "./WindCard";
import { setupI18n } from "./i18nTestUtils";

const renderCard = (props, lng = "en") => {
  setupI18n(lng);
  return render(<WindCard {...props} />);
};

const WIND_PILLS = ["Calm", "Light Breeze", "Moderate Breeze", "Strong Wind"];

describe("WindCard — valid wind data", () => {
  test("shows direction, bearing and a rotating arrow", () => {
    const { container } = renderCard({
      value: "18",
      unit: "km/h",
      windDeg: 90,
      windSpeed: 5,
      gust: null,
    });

    expect(screen.queryByLabelText("Wind direction E at 90 degrees")).not.toBeNull();
    expect(screen.queryByText("E 90°")).not.toBeNull();
    expect(container.querySelector('g[transform="rotate(90 80 80)"]')).not.toBeNull();
  });

  test("shows a wind-band pill for a valid finite speed", () => {
    renderCard({ value: "3", unit: "m/s", windDeg: 180, windSpeed: 2, gust: null });
    expect(screen.queryByText("Light Breeze")).not.toBeNull();
  });
});

describe("WindCard — missing direction (no fake North)", () => {
  test("null deg → neutral placeholders and no arrow rotation", () => {
    const { container } = renderCard({
      value: "18",
      unit: "km/h",
      windDeg: null,
      windSpeed: 2,
      gust: null,
    });

    expect(
      screen.queryByLabelText("Wind direction -- at -- degrees")
    ).not.toBeNull();
    expect(screen.queryByText("-- --°")).not.toBeNull();
    expect(container.querySelectorAll('g[transform^="rotate("]').length).toBe(0);
  });

  test("undefined deg → same neutral state (not 0°/North)", () => {
    const { container } = renderCard({
      value: "18",
      unit: "km/h",
      windSpeed: 2,
      gust: null,
    });

    expect(
      screen.queryByLabelText("Wind direction -- at -- degrees")
    ).not.toBeNull();
    expect(container.querySelectorAll('g[transform^="rotate("]').length).toBe(0);
  });

  test("missing direction does not suppress a valid speed band", () => {
    renderCard({
      value: "18",
      unit: "km/h",
      windDeg: null,
      windSpeed: 2,
      gust: null,
    });
    expect(screen.queryByText("Light Breeze")).not.toBeNull();
  });
});

describe("WindCard — missing speed (no fake Calm)", () => {
  test("null speed → no wind-band pill at all", () => {
    renderCard({ value: "--", unit: "km/h", windDeg: 90, windSpeed: null, gust: null });

    for (const pill of WIND_PILLS) {
      expect(screen.queryByText(pill)).toBeNull();
    }
  });

  test("undefined speed → no wind-band pill", () => {
    renderCard({ value: "--", unit: "km/h", windDeg: 90, gust: null });

    for (const pill of WIND_PILLS) {
      expect(screen.queryByText(pill)).toBeNull();
    }
  });
});

describe("WindCard — localized direction aria-label (FIX #4D-M2)", () => {
  test("French aria-label with translated direction", () => {
    renderCard(
      { value: "18", unit: "km/h", windDeg: 90, windSpeed: 5, gust: null },
      "fr"
    );

    expect(
      screen.getByLabelText("Direction du vent : E à 90 degrés")
    ).not.toBeNull();
  });

  test("missing direction stays neutral in French", () => {
    renderCard(
      { value: "18", unit: "km/h", windDeg: null, windSpeed: 2, gust: null },
      "fr"
    );

    expect(
      screen.getByLabelText("Direction du vent : -- à -- degrés")
    ).not.toBeNull();
  });
});
