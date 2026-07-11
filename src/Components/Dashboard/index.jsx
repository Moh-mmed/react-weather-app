import { useState, useEffect } from "react";
import moment from "moment";
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
  isUpdatingLocation,
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
  handleGeoCoords,
}) => {
  const { current, timezone_offset } = weatherData;
  const { temp } = current;
  const { city, country } = currCity;
  const safeTemp = Number.isFinite(temp) ? Math.round(temp) : "--";

  return (
    /* Root app wrapper — full-height, dashboard radial gradient, flex column */
    <div className="flex flex-col min-h-screen desktop:h-screen desktop:min-h-0 desktop:overflow-hidden overflow-y-auto text-primary bg-dashboard-radial px-[clamp(20px,4vw,48px)] pt-7 pb-10 gap-5">

      {/* Header */}
      <header className="flex items-center justify-between gap-6 flex-wrap">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <BrandIcon />
          <div className="font-display font-semibold text-[20px] tracking-[0.2px]">
            Weather<em className="italic text-accent-sun">Me</em>
          </div>
        </div>

        {/* Search form */}
        <NavBarForm
          cityNotFound={cityNotFound}
          handleSearchCity={handleSearchCity}
          handleWeatherData={handleWeatherData}
          handleAirQuality={handleAirQuality}
          handleCurrCity={handleCurrCity}
          handleGeoCoords={handleGeoCoords}
          isUpdatingLocation={isUpdatingLocation}
        />

        {/* Headline: date + city + temp */}
        <div className="flex items-center gap-3.5 text-right max-desktop:text-left">
          <div className="flex flex-col justify-center text-left">
            <div className="text-[13px] leading-[1.25] text-muted font-mono tracking-[0.4px] uppercase">
              <LiveClock timezoneOffset={timezone_offset} />
            </div>
            <div className="text-[14px] leading-[1.25] font-semibold">
              {city}, {country}
            </div>
          </div>
          <div className="flex items-center font-display font-semibold text-[32px] leading-none text-accent-sky">
            {safeTemp}°C
          </div>
        </div>
      </header>

      {/* Main bento grid — 2:1 columns on desktop, single column below */}
      <main
        key={`${weatherData.coord?.lat}-${weatherData.coord?.lon}-${weatherData.dt}`}
        className="dashboard-main flex-1 grid gap-5 min-h-0 animate-fadeIn"
        style={{ gridTemplateColumns: "2.05fr 1fr" }}
      >
        {/* Left column */}
        <div className="dashboard-column grid gap-5 min-h-0" style={{ gridTemplateRows: "auto auto 1fr" }}>
          <HeroPanel weatherData={weatherData} />
          <HourlyOutlook weatherData={weatherData} />
          <ForecastList weatherData={weatherData} />
        </div>

        {/* Right column */}
        <div className="dashboard-column grid gap-5 min-h-0" style={{ gridTemplateRows: "auto auto 1fr" }}>
          <SunPositionPanel weatherData={weatherData} />
          <AirQualityPanel airQuality={airQuality} />
          <StatsGrid weatherData={weatherData} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
