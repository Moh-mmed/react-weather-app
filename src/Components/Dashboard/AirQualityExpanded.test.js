import { render, screen, within } from "@testing-library/react";
import AirQualityExpanded from "./AirQualityExpanded";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts && opts.defaultValue) || key,
  }),
}));

const finiteComponents = {
  pm2_5: 10,
  pm10: 20,
  o3: 30,
  no2: 40,
  so2: 50,
  co: 60,
};

const renderAqi = (components = finiteComponents) =>
  render(
    <AirQualityExpanded
      airQuality={{ list: [{ dt: Date.now() / 1000, components }] }}
    />,
  );

const pm25Row = () => screen.getByText("PM2.5").closest(".flex.flex-col");

describe("AirQualityExpanded — pollutant missing state (FIX #4D L5)", () => {
  test("null pollutant → '--', zero-width neutral bar, no severity styling", () => {
    const { container } = renderAqi({ ...finiteComponents, pm2_5: null });

    const row = pm25Row();
    expect(within(row).getByText("--")).not.toBeNull();
    expect(screen.queryByText("0")).toBeNull();

    const bar = row.querySelector('[class*="bg-white/20"]');
    expect(bar).not.toBeNull();
    expect(bar.style.width).toBe("0%");
    expect(row.querySelector('[class*="5FB88A"]')).toBeNull();
    expect(container.querySelectorAll('[class*="bg-white/20"]').length).toBe(1);
  });

  test("undefined pollutant → same neutral missing treatment", () => {
    renderAqi({ ...finiteComponents, pm2_5: undefined });

    const row = pm25Row();
    expect(within(row).getByText("--")).not.toBeNull();
    expect(screen.queryByText("0")).toBeNull();
  });

  test("NaN pollutant → '--', neutral missing bar", () => {
    renderAqi({ ...finiteComponents, pm2_5: NaN });

    const row = pm25Row();
    expect(within(row).getByText("--")).not.toBeNull();
    const bar = row.querySelector('[class*="bg-white/20"]');
    expect(bar).not.toBeNull();
    expect(bar.style.width).toBe("0%");
  });
});

describe("AirQualityExpanded — pollutant genuine zero (FIX #4D L5)", () => {
  test("pollutant 0 → displays '0', not '--', severity styling preserved", () => {
    renderAqi({ ...finiteComponents, pm2_5: 0 });

    const row = pm25Row();
    expect(within(row).getByText(/^0/)).not.toBeNull();
    expect(within(row).queryByText("--")).toBeNull();
    expect(row.querySelector('[class*="bg-white/20"]')).toBeNull();
    // 0 µg/m³ PM2.5 → green (≤12) severity styling, not neutral missing.
    expect(row.querySelector('[class*="5FB88A"]')).not.toBeNull();
  });
});

describe("AirQualityExpanded — finite pollutant rendering (FIX #4D L5)", () => {
  test("existing width/severity calculation unchanged", () => {
    renderAqi({ ...finiteComponents, pm2_5: 30 });

    const row = pm25Row();
    expect(within(row).queryByText("--")).toBeNull();
    const bar = row.querySelector('[class*="f4d93b"]');
    expect(bar).not.toBeNull();
    // 30 / 75 µg/m³ PM2.5 max → 40% width.
    expect(bar.style.width).toBe("40%");
  });
});
