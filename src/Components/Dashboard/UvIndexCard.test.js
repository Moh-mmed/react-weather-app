import { render, screen } from "@testing-library/react";
import UvIndexCard from "./UvIndexCard";
import { setupI18n } from "./i18nTestUtils";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const renderCard = (uvi) => {
  setupI18n("en");
  return render(<UvIndexCard uvi={uvi} />);
};

describe("UvIndexCard — missing UV (FIX #4C)", () => {
  test("null → '--', never '0', no 'Low Exposure' classification", () => {
    renderCard(null);

    expect(screen.getByText("--")).toBeDefined();
    expect(screen.getByText("Not available")).toBeDefined();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("Low")).toBeNull();
    expect(screen.queryByText("Low Exposure")).toBeNull();
  });

  test("undefined → same neutral state (no fake 0)", () => {
    renderCard(undefined);
    expect(screen.getByText("--")).toBeDefined();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("Low Exposure")).toBeNull();
  });

  test("NaN → same neutral state", () => {
    renderCard(NaN);
    expect(screen.getByText("--")).toBeDefined();
    expect(screen.queryByText("0")).toBeNull();
  });
});

describe("UvIndexCard — daytime vs nighttime semantics (ISSUE #1)", () => {
  const SUNRISE = 1_700_000_000;
  const SUNSET = 1_700_043_200; // +12 hours
  const DAYTIME = 1_700_020_000; // midday
  const NIGHTTIME = 1_700_050_000; // post-sunset
  const EARLY_MORNING = 1_699_990_000; // pre-sunrise

  test("daytime: uvi 9 displays primary 9, Very High, and no secondary peak text", () => {
    setupI18n("en");
    render(
      <UvIndexCard
        uvi={9}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={DAYTIME}
      />
    );

    expect(screen.getByText("9")).toBeDefined();
    expect(screen.getByText("Very High")).toBeDefined();
    expect(screen.getByText("Very High Exposure")).toBeDefined();
    expect(screen.queryByText(/Today's peak/)).toBeNull();
  });

  test("nighttime (post-sunset): uvi 9 displays primary 0, Low, Low Exposure, and preserves peak 9", () => {
    setupI18n("en");
    render(
      <UvIndexCard
        uvi={9}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={NIGHTTIME}
      />
    );

    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("Low")).toBeDefined();
    expect(screen.getByText("Low Exposure")).toBeDefined();
    expect(screen.getByText("Today's peak: 9")).toBeDefined();
  });

  test("nighttime (pre-sunrise): uvi 9 displays primary 0 and secondary peak 9", () => {
    setupI18n("en");
    render(
      <UvIndexCard
        uvi={9}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={EARLY_MORNING}
      />
    );

    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("Today's peak: 9")).toBeDefined();
  });

  test("missing sunrise/sunset/time data falls back cleanly to daytime uvi 9", () => {
    setupI18n("en");
    render(<UvIndexCard uvi={9} />);

    expect(screen.getByText("9")).toBeDefined();
    expect(screen.getByText("Very High")).toBeDefined();
    expect(screen.queryByText(/Today's peak/)).toBeNull();
  });

  test("nighttime with missing UV renders primary 0 without peak subtext", () => {
    setupI18n("en");
    render(
      <UvIndexCard
        uvi={null}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={NIGHTTIME}
      />
    );

    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("Low")).toBeDefined();
    expect(screen.queryByText(/Today's peak/)).toBeNull();
  });

  test("translation rendering across locales (en, fr, ar)", () => {
    // English
    setupI18n("en");
    const { unmount: u1 } = render(
      <UvIndexCard
        uvi={8}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={NIGHTTIME}
      />
    );
    expect(screen.getByText("Today's peak: 8")).toBeDefined();
    u1();

    // French
    setupI18n("fr");
    const { unmount: u2 } = render(
      <UvIndexCard
        uvi={8}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={NIGHTTIME}
      />
    );
    expect(screen.getByText("Pic du jour : 8")).toBeDefined();
    u2();

    // Arabic
    setupI18n("ar");
    render(
      <UvIndexCard
        uvi={8}
        sunrise={SUNRISE}
        sunset={SUNSET}
        currentTime={NIGHTTIME}
      />
    );
    expect(screen.getByText("أعلى مستوى اليوم: 8")).toBeDefined();
  });
});
