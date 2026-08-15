import { render, screen } from "@testing-library/react";
import VisibilityCard from "./VisibilityCard";
import { setupI18n } from "./i18nTestUtils";

const renderCard = (props, lng = "en") => {
  setupI18n(lng);
  return render(<VisibilityCard {...props} />);
};

describe("VisibilityCard — missing visibility (FIX #4C)", () => {
  test("visKm null → '--' value, no 'Poor' band, no status pill", () => {
    renderCard({ value: "--", unit: "km", visKm: null });

    expect(screen.queryByText("--")).not.toBeNull();
    expect(screen.queryByText("Not available")).not.toBeNull();
    expect(screen.queryByText("Poor")).toBeNull();
    expect(screen.queryByText("Moderate")).toBeNull();
    expect(screen.queryByText("Excellent")).toBeNull();
  });

  test("visKm undefined → same neutral state (not full-scale Excellent)", () => {
    renderCard({ value: "--", unit: "km" });

    expect(screen.queryByText("--")).not.toBeNull();
    expect(screen.queryByText("Not available")).not.toBeNull();
    expect(screen.queryByText("Poor")).toBeNull();
    expect(screen.queryByText("Excellent")).toBeNull();
  });
});

describe("VisibilityCard — valid visibility", () => {
  test("genuine 0 km → 'Poor' band (real zero, not missing)", () => {
    renderCard({ value: "0.0", unit: "km", visKm: 0 });

    expect(screen.queryByText("0.0")).not.toBeNull();
    expect(screen.queryAllByText("Poor").length).toBeGreaterThan(0);
  });

  test("1 km → 'Poor'", () => {
    renderCard({ value: "1.0", unit: "km", visKm: 1 });
    expect(screen.queryAllByText("Poor").length).toBeGreaterThan(0);
  });

  test("10 km → 'Excellent'", () => {
    renderCard({ value: "10.0", unit: "km", visKm: 10 });
    expect(screen.queryAllByText("Excellent").length).toBeGreaterThan(0);
  });
});

describe("VisibilityCard — localized aria-label (FIX #4D-M2)", () => {
  test("French aria-label with translated status", () => {
    renderCard({ value: "10.0", unit: "km", visKm: 10 }, "fr");

    expect(
      screen.getByLabelText("Visibilité : 10.0 km, Excellente")
    ).not.toBeNull();
  });

  test("missing visibility uses translated 'not available' in label", () => {
    renderCard({ value: "--", unit: "km", visKm: null }, "fr");

    expect(
      screen.getByLabelText("Visibilité : -- km, Indisponible")
    ).not.toBeNull();
  });
});
