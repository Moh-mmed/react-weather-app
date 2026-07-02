import { getUsAqiFromComponents } from "../../helpers/getUsAqi";
import {
  Panel,
  PanelTitle,
  AqiTop,
  AqiNum,
  AqiTag,
  AqiPollutant,
  Gauge,
  GaugeMarker,
  GaugeScale,
} from "./StyledDashboard";

const AqiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h4l2-6 4 12 2-6h6" />
  </svg>
);

const AirQualityPanel = ({ airQuality }) => {
  const { components } = airQuality.list[0];
  const { aqi, label, mainPollutant, markerPercent } =
    getUsAqiFromComponents(components);

  return (
    <Panel $delay="0.05s">
      <PanelTitle>
        <AqiIcon />
        Air Quality
      </PanelTitle>
      <AqiTop>
        <AqiNum>{aqi}</AqiNum>
        <AqiTag>{label}</AqiTag>
      </AqiTop>
      <AqiPollutant>Main pollutant — {mainPollutant}</AqiPollutant>
      <Gauge>
        <GaugeMarker $left={markerPercent} />
      </Gauge>
      <GaugeScale>
        <span>Good</span>
        <span>Moderate</span>
        <span>USG</span>
        <span>Unhealthy</span>
        <span>Hazardous</span>
      </GaugeScale>
    </Panel>
  );
};

export default AirQualityPanel;
