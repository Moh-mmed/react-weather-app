import { render, screen } from "@testing-library/react";
import MoonCard from "./MoonCard";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts && opts.defaultValue) || key,
  }),
}));

jest.mock("../MoonDisplay", () => ({
  __esModule: true,
  default: () => <div data-testid="moon-display" />,
  usePrefersReducedMotion: () => true,
}));

const renderMoon = (props = {}) =>
  render(
    <MoonCard
      moonPhase={0.5}
      moonPhaseName="First Quarter"
      illumination={65}
      moonrise="--:--"
      moonset="--:--"
      nextFullMoon={null}
      moonRaw={null}
      {...props}
    />,
  );

describe("MoonCard — illumination missing state (FIX #4D L4)", () => {
  test("null illumination → '--', never '0% Illuminated'", () => {
    renderMoon({ illumination: null });
    expect(screen.getByText(/--% Illuminated/)).not.toBeNull();
    expect(screen.queryByText("0% Illuminated")).toBeNull();
  });

  test("NaN illumination → '--', never '0% Illuminated'", () => {
    renderMoon({ illumination: NaN });
    expect(screen.getByText(/--% Illuminated/)).not.toBeNull();
    expect(screen.queryByText("0% Illuminated")).toBeNull();
  });

  test("undefined illumination → '--', never '0% Illuminated'", () => {
    renderMoon({ illumination: undefined });
    expect(screen.getByText(/--% Illuminated/)).not.toBeNull();
    expect(screen.queryByText("0% Illuminated")).toBeNull();
  });

  test("illumination 0 → genuine zero, not treated as missing", () => {
    renderMoon({ illumination: 0 });
    expect(screen.getByText("0% Illuminated")).not.toBeNull();
    expect(screen.queryByText(/--% Illuminated/)).toBeNull();
  });

  test("finite illumination → existing output unchanged", () => {
    renderMoon({ illumination: 65 });
    expect(screen.getByText("65% Illuminated")).not.toBeNull();
    expect(screen.queryByText(/--% Illuminated/)).toBeNull();
    expect(screen.queryByText("0% Illuminated")).toBeNull();
  });
});
