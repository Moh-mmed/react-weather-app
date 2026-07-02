import { getDewPoint } from "../../helpers/getDewPoint";
import { getWindDirectionAbbr } from "../../helpers/getWindDirection";
import {
  StatsGrid as StatsGridShell,
  StatTile,
  StatTop,
  StatLabel,
  StatValue,
} from "./StyledDashboard";

const StatIcon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {children}
  </svg>
);

const StatsGrid = ({ weatherData }) => {
  const { current } = weatherData;
  const {
    pressure,
    humidity,
    wind_speed,
    wind_deg,
    visibility,
    temp,
    clouds,
  } = current;

  const dewPoint = getDewPoint(temp, humidity);
  const windKmh = Number.isFinite(wind_speed)
    ? Math.round(wind_speed * 3.6)
    : "--";
  const windDir = getWindDirectionAbbr(wind_deg);
  const visibilityKm = Number.isFinite(visibility)
    ? (visibility / 1000).toFixed(1)
    : "--";

  const stats = [
    {
      label: "Pressure",
      value: Number.isFinite(pressure) ? pressure : "--",
      unit: "hPa",
      icon: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </>
      ),
    },
    {
      label: "Humidity",
      value: Number.isFinite(humidity) ? humidity : "--",
      unit: "%",
      icon: <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" />,
    },
    {
      label: "Wind",
      value: windKmh,
      unit: `km/h ${windDir}`,
      icon: (
        <>
          <path d="M3 8h11a3 3 0 1 0-3-3" />
          <path d="M3 16h14a3 3 0 1 1-3 3" />
        </>
      ),
    },
    {
      label: "Visibility",
      value: visibilityKm,
      unit: "km",
      icon: (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ),
    },
    {
      label: "Dew Point",
      value: Number.isFinite(dewPoint) ? dewPoint : "--",
      unit: "°C",
      icon: (
        <>
          <path d="M12 2v6M9 5l3 3 3-3" />
          <circle cx="12" cy="15" r="6" />
        </>
      ),
    },
    {
      label: "Cloud Cover",
      value: Number.isFinite(clouds) ? clouds : "--",
      unit: "%",
      icon: (
        <path d="M6 17a4 4 0 1 1 1-7.9 5 5 0 0 1 9.6 1.9A3.5 3.5 0 0 1 16 17H6z" />
      ),
    },
  ];

  return (
    <StatsGridShell>
      {stats.map((stat) => (
        <StatTile key={stat.label}>
          <StatTop>
            <StatLabel>{stat.label}</StatLabel>
            <StatIcon>{stat.icon}</StatIcon>
          </StatTop>
          <StatValue>
            {stat.value}
            <small>{stat.unit}</small>
          </StatValue>
        </StatTile>
      ))}
    </StatsGridShell>
  );
};

export default StatsGrid;
