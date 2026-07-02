import moment from "moment";
import {
  Panel,
  PanelTitle,
  HourlyRow,
  HourCard,
  HourLabel,
  HourValue,
  HourIcon,
} from "./StyledDashboard";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const HourlyOutlook = ({ weatherData }) => {
  const { outlook24h, timezone_offset } = weatherData;

  return (
    <Panel $delay="0.05s">
      <PanelTitle>
        <ClockIcon />
        24-Hour Outlook
      </PanelTitle>
      <HourlyRow>
        {outlook24h.map((entry) => {
          const label = entry.isNow
            ? "Now"
            : moment
                .unix(entry.dt)
                .utcOffset(timezone_offset / 3600)
                .format("ha")
                .toUpperCase();
          const icon = entry.weather?.[0]?.icon ?? "01d";

          return (
            <HourCard key={entry.dt} $active={entry.isNow}>
              <HourLabel $active={entry.isNow}>{label}</HourLabel>
              <HourIcon
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt=""
              />
              <HourValue>{Math.round(entry.temp)}°</HourValue>
            </HourCard>
          );
        })}
      </HourlyRow>
    </Panel>
  );
};

export default HourlyOutlook;
