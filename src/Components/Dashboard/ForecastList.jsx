import moment from "moment";
import {
  ForecastPanel,
  PanelTitle,
  ForecastList as ForecastListShell,
  ForecastRow,
  ForecastIcon,
  ForecastDay,
  ForecastCond,
  ForecastPrecip,
  ForecastRange,
} from "./StyledDashboard";

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </svg>
);

const ForecastList = ({ weatherData }) => {
  const { daily, timezone_offset } = weatherData;
  const forecastDays = daily.slice(0, 7);

  return (
    <ForecastPanel $delay="0.1s">
      <PanelTitle>
        <CalendarIcon />
        7-Day Forecast
      </PanelTitle>
      <ForecastListShell>
        {forecastDays.map((day, index) => {
          const { weather, temp, dt, pop } = day;
          const { icon, main, description } = weather[0];
          const isToday = index === 0;
          const dayLabel = isToday
            ? "Today"
            : moment
                .unix(dt)
                .utcOffset(timezone_offset / 3600)
                .format("ddd, MMM DD");

          return (
            <ForecastRow key={dt} $today={isToday}>
              <ForecastIcon
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt={description}
              />
              <div>
                <ForecastDay>{dayLabel}</ForecastDay>
                <ForecastCond>{main}</ForecastCond>
              </div>
              <ForecastPrecip>{pop ?? 0}% rain</ForecastPrecip>
              <ForecastRange>
                <span>{temp.max}°</span> <span className="lo">/ {temp.min}°</span>
              </ForecastRange>
            </ForecastRow>
          );
        })}
      </ForecastListShell>
    </ForecastPanel>
  );
};

export default ForecastList;
