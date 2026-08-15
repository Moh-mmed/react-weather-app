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

    expect(screen.queryByText("--")).not.toBeNull();
    expect(screen.queryByText("Not available")).not.toBeNull();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("Low")).toBeNull();
    expect(screen.queryByText("Low Exposure")).toBeNull();
  });

  test("undefined → same neutral state (no fake 0)", () => {
    renderCard(undefined);
    expect(screen.queryByText("--")).not.toBeNull();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("Low Exposure")).toBeNull();
  });

  test("NaN → same neutral state", () => {
    renderCard(NaN);
    expect(screen.queryByText("--")).not.toBeNull();
    expect(screen.queryByText("0")).toBeNull();
  });
});

describe("UvIndexCard — valid UV", () => {
  test("genuine 0 is preserved and classified as Low", () => {
    renderCard(0);
    expect(screen.queryByText("0")).not.toBeNull();
    expect(screen.queryByText("Low")).not.toBeNull();
  });

  test("category boundaries are unchanged", () => {
    const { unmount } = renderCard(3);
    expect(screen.queryByText("Moderate")).not.toBeNull();
    unmount();

    renderCard(6);
    expect(screen.queryByText("High")).not.toBeNull();
    unmount();

    renderCard(8);
    expect(screen.queryByText("Very High")).not.toBeNull();
    unmount();

    renderCard(11);
    expect(screen.queryByText("Extreme")).not.toBeNull();
  });
});
