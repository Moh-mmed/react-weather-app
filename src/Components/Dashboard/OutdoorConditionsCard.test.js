import { render, screen } from "@testing-library/react";
import OutdoorConditionsCard from "./OutdoorConditionsCard";
import { UnitProvider } from "../../contexts/UnitContext";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts && opts.defaultValue) || key,
  }),
}));

const mockPage = {
  weatherData: {
    current: {
      uvi: 0,
      visibility: 10000,
      wind_speed: 5.3,
      humidity: 19,
    },
  },
  airQuality: {
    list: [
      {
        components: {
          co: 200,
          no2: 5,
          o3: 40,
          pm2_5: 8,
          pm10: 15,
          so2: 2,
        },
      },
    ],
  },
};

describe("OutdoorConditionsCard", () => {
  test("renders card with header, hero banner, advice items, and activity pills", () => {
    render(
      <UnitProvider>
        <OutdoorConditionsCard page={mockPage} />
      </UnitProvider>
    );

    expect(screen.getByText("OUTDOOR CONDITIONS")).not.toBeNull();
    expect(screen.getByText("Good, with precautions")).not.toBeNull();
    expect(screen.getByText("Mild UV Exposure")).not.toBeNull();
    expect(screen.getByText("Stay Hydrated")).not.toBeNull();
    expect(screen.getByText("Comfortable Breeze")).not.toBeNull();
    expect(screen.getByText("BEST FOR")).not.toBeNull();
    expect(screen.getByText("Walking")).not.toBeNull();
    expect(screen.getByText("Photography")).not.toBeNull();
    expect(screen.getByText("Outdoor Café")).not.toBeNull();
  });

  test("renders safely when data is missing", () => {
    render(
      <UnitProvider>
        <OutdoorConditionsCard page={{}} />
      </UnitProvider>
    );

    expect(screen.getByText("OUTDOOR CONDITIONS")).not.toBeNull();
  });
});
