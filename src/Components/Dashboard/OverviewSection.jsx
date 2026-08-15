import HeroPanel from "./HeroPanel";
import HourlyOutlook from "./HourlyOutlook";
import SunPositionPanel from "./SunPositionPanel";
import ForecastList from "./ForecastList";
import AirQualityExpanded from "./AirQualityExpanded";
import DetailsSection from "./DetailsSection";

const OverviewSection = ({ page, currentTime, onRemove }) => {
  const { weatherData, airQuality, isPinned, astronomy } = page;

  return (
    <div
      className="dashboard-main w-full min-h-full grid gap-5 items-start animate-fadeIn"
      style={{
        gridTemplateColumns: "2.05fr 1fr",
      }}
    >
      {/* Left column: hero → hourly → 7-day forecast (natural height) */}
      <div
        className="dashboard-stack grid gap-5"
        style={{ gridTemplateRows: "auto auto" }}
      >
        <HeroPanel
          weatherData={weatherData}
          isPinned={isPinned}
          onRemove={onRemove}
          currentTime={currentTime}
        />
        <HourlyOutlook weatherData={weatherData} />
        <ForecastList weatherData={weatherData} />
        <DetailsSection page={page} />
      </div>

      {/* Right column: independent of the left column's height */}
      <div
        className="dashboard-stack grid gap-5"
        style={{ gridTemplateRows: "auto auto" }}
      >
        <SunPositionPanel
          weatherData={weatherData}
          currentTime={currentTime}
          astronomy={astronomy}
          city={page.city}
        />
        <AirQualityExpanded airQuality={airQuality} />
      </div>
    </div>
  );
};

export default OverviewSection;
