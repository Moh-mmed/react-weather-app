import moment from "moment";
import {
  ForecastPanel,
  PanelTitle,
  ForecastGrid,
  ForecastCard,
  ForecastCardTop,
  ForecastIcon,
  ForecastDay,
  ForecastCond,
  ForecastTempRow,
  ForecastMeta,
  ForecastMetaRow,
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
      <ForecastGrid>
        {forecastDays.map((day) => {
          const { weather, temp, dt, pop, humidity, wind_speed } = day;
          const { icon, main, description } = weather[0];
          const dayLabel = moment
            .unix(dt)
            .utcOffset(timezone_offset / 3600)
            .format("ddd, MMM DD");
          const windKmh = Number.isFinite(wind_speed)
            ? Math.round(wind_speed * 3.6)
            : null;

          return (
            <ForecastCard key={dt}>
              <ForecastCardTop>
                <div>
                  <ForecastDay>{dayLabel}</ForecastDay>
                  <ForecastCond>{main}</ForecastCond>
                </div>
                <ForecastIcon
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt={description}
                />
              </ForecastCardTop>

              <ForecastTempRow>
                <span>{temp.max}°</span> <span className="lo">/ {temp.min}°</span>
              </ForecastTempRow>

              <ForecastMeta>
                <ForecastMetaRow>
                  <span>Precip</span>
                  <b>{pop ?? 0}%</b>
                </ForecastMetaRow>
                <ForecastMetaRow>
                  <span>Humidity</span>
                  <b>{Number.isFinite(humidity) ? `${humidity}%` : "--"}</b>
                </ForecastMetaRow>
                <ForecastMetaRow>
                  <span>Wind</span>
                  <b>{Number.isFinite(windKmh) ? `${windKmh} km/h` : "--"}</b>
                </ForecastMetaRow>
              </ForecastMeta>
            </ForecastCard>
          );
        })}
      </ForecastGrid>
    </ForecastPanel>
  );
};

export default ForecastList;
