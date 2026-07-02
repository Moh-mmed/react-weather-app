import {
  HeroPanel as HeroPanelShell,
  HeroGlow,
  HeroLeft,
  HeroCondition,
  HeroTemp,
  HeroSub,
  HeroIcon,
} from "./StyledDashboard";

const HeroPanel = ({ weatherData }) => {
  const { current, daily } = weatherData;
  const { temp, feels_like, weather } = current;
  const { description, icon } = weather[0];
  const today = daily[0];
  const high = today?.temp?.max;
  const low = today?.temp?.min;
  const displayTemp = Number.isFinite(temp) ? Math.round(temp) : "--";
  const displayFeels = Number.isFinite(feels_like)
    ? Math.round(feels_like)
    : "--";
  const displayHigh = Number.isFinite(high) ? high : "--";
  const displayLow = Number.isFinite(low) ? low : "--";

  return (
    <HeroPanelShell $delay="0s">
      <HeroGlow />
      <HeroLeft>
        <HeroCondition>{description}</HeroCondition>
        <HeroTemp>{displayTemp}°</HeroTemp>
        <HeroSub>
          <span>
            Feels like <b>{displayFeels}°</b>
          </span>
          <span>
            High <b>{displayHigh}°</b> · Low <b>{displayLow}°</b>
          </span>
        </HeroSub>
      </HeroLeft>
      <HeroIcon
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt={description}
      />
    </HeroPanelShell>
  );
};

export default HeroPanel;
