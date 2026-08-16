import { render, screen } from "@testing-library/react";
import HourlyOutlook from "./HourlyOutlook";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock("../../contexts/UnitContext", () => ({
  useUnit: () => ({
    convertTemp: (c) => (Number.isFinite(c) ? Math.round(c) : "--"),
  }),
}));

jest.mock("../../contexts/TimeFormatContext", () => ({
  useTimeFormat: () => ({ hourFormat: "24h" }),
}));

const entry = (dt, temp) => ({
  dt,
  temp,
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
});

const renderOutlook = (outlook48h) =>
  render(<HourlyOutlook weatherData={{ outlook48h, timezone_offset: 3600 }} />);

const trendPath = (container) =>
  container.querySelector('path[stroke="url(#temp-gradient)"]');

describe("HourlyOutlook — missing temperature in the 48h window (FIX #4C)", () => {
  test("one null temperature among valid values → chart stays finite, point omitted", () => {
    const { container } = renderOutlook([
      entry(100, 20),
      entry(200, null),
      entry(300, 24),
    ]);

    const d = trendPath(container).getAttribute("d");
    expect(d).not.toContain("NaN");

    // Two data dots (the missing point is omitted, not fabricated).
    const dots = container.querySelectorAll('circle[class*="drop-shadow"]');
    expect(dots.length).toBe(2);

    // The text layer still renders the raw per-hour labels including "--".
    expect(screen.queryByText("--°")).not.toBeNull();
  });

  test("all temperatures missing → no NaN geometry, still renders", () => {
    const { container } = renderOutlook([entry(100, null), entry(200, null)]);

    const d = trendPath(container).getAttribute("d");
    expect(d).not.toContain("NaN");
  });

  test("all temperatures present → one data dot per sample", () => {
    const { container } = renderOutlook([
      entry(100, 20),
      entry(200, 22),
      entry(300, 24),
    ]);

    const dots = container.querySelectorAll('circle[class*="drop-shadow"]');
    expect(dots.length).toBe(3);
    expect(trendPath(container).getAttribute("d")).not.toContain("NaN");
  });
});
