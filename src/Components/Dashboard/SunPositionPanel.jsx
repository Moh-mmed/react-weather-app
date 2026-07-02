import getTiming from "../../helpers/getTiming";
import { getUviDescription } from "../../helpers/getUVI";
import { getSunArcPoint, SUN_ARC_BASE } from "../../helpers/sunArc";
import {
  Panel,
  PanelTitle,
  ArcWrap,
  ArcLabels,
  ArcLabelBlock,
  ArcLabelKey,
  ArcLabelValue,
  UvChip,
  UvNum,
  UvDesc,
  SunDot,
} from "./StyledDashboard";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
  </svg>
);

const SunPositionPanel = ({ weatherData }) => {
  const { current, timezone_offset } = weatherData;
  const { dt, uvi, sunrise, sunset } = current;
  const { day, width, Sunrise, Sunset } = getTiming(
    sunrise,
    sunset,
    dt,
    timezone_offset
  );
  const progress = day ? width / 100 : 0;
  const arcPoint = getSunArcPoint(progress);
  const UVI = Number.isFinite(uvi) ? Math.round(uvi) : "--";
  const uviCopy = getUviDescription(Number.isFinite(uvi) ? uvi : null);

  return (
    <Panel $delay="0s">
      <PanelTitle>
        <SunIcon />
        Sun Position
      </PanelTitle>
      <ArcWrap>
        <svg viewBox="0 0 350 175" width="100%" style={{ marginTop: 8 }}>
          <path
            d={SUN_ARC_BASE}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
          <path
            d={SUN_ARC_BASE}
            stroke="#4FA3D9"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {day && (
            <SunDot cx={arcPoint.x} cy={arcPoint.y} r="8" fill="#F4A93B" />
          )}
          <circle cx="25" cy="170" r="4" fill="#8CA1B4" />
          <circle cx="325" cy="170" r="4" fill="#8CA1B4" />
        </svg>
        <ArcLabels>
          <ArcLabelBlock>
            <ArcLabelKey>Sunrise</ArcLabelKey>
            <ArcLabelValue>{Sunrise}</ArcLabelValue>
          </ArcLabelBlock>
          <ArcLabelBlock $align="right">
            <ArcLabelKey>Sunset</ArcLabelKey>
            <ArcLabelValue>{Sunset}</ArcLabelValue>
          </ArcLabelBlock>
        </ArcLabels>
        <UvChip>
          <UvNum>{UVI}</UvNum>
          <UvDesc>
            <b>{uviCopy.title}.</b> {uviCopy.description}
          </UvDesc>
        </UvChip>
      </ArcWrap>
    </Panel>
  );
};

export default SunPositionPanel;
