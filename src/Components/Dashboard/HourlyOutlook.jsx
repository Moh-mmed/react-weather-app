import { formatHour24 } from "../../helpers/timeFormat";
import {
  Panel,
  PanelTitle,
  HourlyRow,
  HourCard,
  HourLabel,
  HourValue,
  HourIcon,
  HourlyEmpty,
} from "./StyledDashboard";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const HourlyOutlook = ({ weatherData }) => {
  const { outlook48h, timezone_offset } = weatherData;

  return (
    <Panel $delay="0.05s">
      <PanelTitle>
        <ClockIcon />
        48-Hour Outlook
      </PanelTitle>
      <HourlyRow>
        {outlook48h.length ? (
          outlook48h.map((entry) => {
            const label = `${formatHour24(entry.dt, timezone_offset)}:00`;
            const icon = entry.weather?.[0]?.icon ?? "01d";

            return (
              <HourCard key={entry.dt} $interpolated={entry.isInterpolated}>
                <HourLabel>{label}</HourLabel>
                <HourIcon
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt=""
                />
                <HourValue>{Math.round(entry.temp)}°</HourValue>
              </HourCard>
            );
          })
        ) : (
          <HourlyEmpty>
            48-hour hourly forecast requires OpenWeather One Call 3.0 access.
          </HourlyEmpty>
        )}
      </HourlyRow>
    </Panel>
  );
};

export default HourlyOutlook;
