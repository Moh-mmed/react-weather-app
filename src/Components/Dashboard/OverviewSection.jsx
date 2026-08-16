import HeroPanel from "./HeroPanel";
import HourlyOutlook from "./HourlyOutlook";
import SunPositionPanel from "./SunPositionPanel";
import ForecastList from "./ForecastList";
import AirQualityExpanded from "./AirQualityExpanded";
import OutdoorConditionsCard from "./OutdoorConditionsCard";
import DetailsSection from "./DetailsSection";

const OverviewSection = ({ page, currentTime, onRemove }) => {
  const { weatherData, airQuality, isPinned, astronomy } = page;

  return (
    <div
      className="dashboard-main w-full min-h-full grid gap-5 items-stretch animate-fadeIn"
      style={{
        gridTemplateColumns: "2.05fr 1fr",
      }}
    >
      {/* Left column: hero → hourly → 7-day forecast → six metric cards (fills remaining height so the card block ends level with the outdoor conditions panel) */}
      <div
        className="dashboard-stack grid gap-5"
        style={{ gridTemplateRows: "auto auto auto minmax(0, 1fr)" }}
      >
        <HeroPanel
          weatherData={weatherData}
          isPinned={isPinned}
          onRemove={onRemove}
          currentTime={currentTime}
        />
        <HourlyOutlook weatherData={weatherData} />
        <ForecastList weatherData={weatherData} />
        <DetailsSection page={page} currentTime={currentTime} />
      </div>

      {/* Right column: independent of the left column's height */}
      <div
        className="dashboard-stack grid gap-5"
        style={{ gridTemplateRows: "auto auto minmax(0, 1fr)" }}
      >
        <SunPositionPanel
          weatherData={weatherData}
          currentTime={currentTime}
          astronomy={astronomy}
          city={page.city}
        />
        <AirQualityExpanded airQuality={airQuality} />
        <OutdoorConditionsCard page={page} />
      </div>
    </div>
  );
};

export default OverviewSection;
