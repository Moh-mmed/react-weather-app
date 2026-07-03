import { useState, useEffect } from "react";
import moment from "moment";
import {
  DashboardApp,
  DashboardHeader,
  Brand,
  BrandWord,
  Headline,
  HeadlinePlace,
  HeadlineDay,
  HeadlineLoc,
  HeadlineTemp,
  DashboardMain,
  LeftColumn,
  RightColumn,
} from "./StyledDashboard";
import NavBarForm from "../Main/NavBar/NavBarForm";
import HeroPanel from "./HeroPanel";
import HourlyOutlook from "./HourlyOutlook";
import StatsGrid from "./StatsGrid";
import SunPositionPanel from "./SunPositionPanel";
import AirQualityPanel from "./AirQualityPanel";
import ForecastList from "./ForecastList";
import { formatTime24 } from "../../helpers/timeFormat";

const BrandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="30" height="30" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="#F4A93B" strokeWidth="1.6" />
    <g stroke="#4FA3D9" strokeWidth="1.6" strokeLinecap="round">
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
      <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
      <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
      <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
    </g>
  </svg>
);

const LiveClock = ({ timezoneOffset }) => {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    // Update every 10 seconds (10000ms) to keep HH:mm accurate
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const dayLabel = moment
    .unix(now)
    .utcOffset(timezoneOffset / 3600)
    .format("ddd DD MMM")
    .toUpperCase();
  const clock = formatTime24(now, timezoneOffset);

  return (
    <>
      {dayLabel} · {clock}
    </>
  );
};

const Dashboard = ({
  weatherData,
  airQuality,
  currCity,
  cityNotFound,
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
}) => {
  const { current, timezone_offset } = weatherData;
  const { temp } = current;
  const { city, country } = currCity;
  const safeTemp = Number.isFinite(temp) ? Math.round(temp) : "--";

  return (
    <DashboardApp>
      <DashboardHeader>
        <Brand>
          <BrandIcon />
          <BrandWord>
            Weather<em>Me</em>
          </BrandWord>
        </Brand>

        <NavBarForm
          cityNotFound={cityNotFound}
          handleSearchCity={handleSearchCity}
          handleWeatherData={handleWeatherData}
          handleAirQuality={handleAirQuality}
          handleCurrCity={handleCurrCity}
        />

        <Headline>
          <HeadlinePlace>
            <HeadlineDay>
              <LiveClock timezoneOffset={timezone_offset} />
            </HeadlineDay>
            <HeadlineLoc>
              {city}, {country}
            </HeadlineLoc>
          </HeadlinePlace>
          <HeadlineTemp>{safeTemp}°C</HeadlineTemp>
        </Headline>
      </DashboardHeader>

      <DashboardMain>
        <LeftColumn>
          <HeroPanel weatherData={weatherData} />
          <HourlyOutlook weatherData={weatherData} />
          <ForecastList weatherData={weatherData} />
        </LeftColumn>

        <RightColumn>
          <SunPositionPanel weatherData={weatherData} />
          <AirQualityPanel airQuality={airQuality} />
          <StatsGrid weatherData={weatherData} />
        </RightColumn>
      </DashboardMain>
    </DashboardApp>
  );
};

export default Dashboard;
