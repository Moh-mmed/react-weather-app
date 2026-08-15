import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import getTiming from "../../../helpers/getTiming";
import { getSunArcPoint, SUN_ARC_BASE } from "../../../helpers/sunArc";
import { useTimeFormat } from "../../../contexts/TimeFormatContext";
import {
  getSkyPhase,
  getSunColor,
  getSunsetProgress,
  localTimeStringToUnix,
  getMoonVisibility,
  isNight as checkIsNight,
} from "../../../helpers/sunArcUtils";

import SkyGradient from "./SkyGradient";
import SunBody from "./SunBody";
import MoonBody from "./MoonBody";
import StarField from "./StarField";
import MoonCard from "./MoonCard";

// ─── Panel title icons ────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

// ─── Arc color per phase ──────────────────────────────────────────────────────
const ARC_STROKE = {
  dawn:        '#b08060',
  morning:     '#5ab8e8',
  day:         '#4FA3D9',
  sunset:      '#e07030',
  'blue-hour': '#5060a0',
  night:       '#304878',
};

// ─── Main component ───────────────────────────────────────────────────────────
const SunPositionPanel = ({ weatherData, currentTime, astronomy }) => {
  const { t } = useTranslation();
  const { hourFormat } = useTimeFormat();
  const { current, timezone_offset } = weatherData;
  const { dt, sunrise, sunset } = current;
  const displayTime = Number.isFinite(currentTime) ? currentTime : dt;

  const { day, width, Sunrise, Sunset } = getTiming(
    sunrise,
    sunset,
    displayTime,
    timezone_offset,
    hourFormat
  );

  // ── Sky phase & progress calculations (memoized) ──────────────────────────
  const phase = useMemo(
    () => getSkyPhase(displayTime, sunrise, sunset),
    [displayTime, sunrise, sunset]
  );

  const sunsetT = useMemo(
    () => getSunsetProgress(displayTime, sunset),
    [displayTime, sunset]
  );

  const sunColor = useMemo(
    () => getSunColor(phase, sunsetT),
    [phase, sunsetT]
  );

  const night = useMemo(
    () => checkIsNight(displayTime, sunrise, sunset),
    [displayTime, sunrise, sunset]
  );

  const starsVisible = phase === 'night' || phase === 'blue-hour';

  const hemisphere =
    (weatherData.coord?.lat ?? 0) < 0 ? "southern" : "northern";

  const moonRaw = astronomy?.raw ?? null;

  // ── Arc position ────────────────────────────────────────────────────────────
  const daySunProgress = useMemo(
    () => day ? width / 100 : 0,
    [day, width]
  );

  // Sun moves 0→1 during the day
  const sunArcPoint = useMemo(
    () => getSunArcPoint(daySunProgress),
    [daySunProgress]
  );

  // Moon position uses the moon's OWN rise/set times (not the sun's day/night
  // window), so the dot only sits on the arc while the moon is actually above
  // the horizon — and tracks moonrise→moonset rather than sunset→sunrise.
  const moonRiseTs = useMemo(
    () => localTimeStringToUnix(moonRaw?.moonriseDate, moonRaw?.moonrise, timezone_offset),
    [moonRaw, timezone_offset],
  );

  const moonSetTs = useMemo(
    () => localTimeStringToUnix(moonRaw?.moonsetDate, moonRaw?.moonset, timezone_offset),
    [moonRaw, timezone_offset],
  );

  const { isUp: moonIsUp, progress: moonProgress } = useMemo(
    () => getMoonVisibility(moonRiseTs, moonSetTs, displayTime),
    [moonRiseTs, moonSetTs, displayTime],
  );

  const moonArcPoint = useMemo(
    () => getSunArcPoint(moonProgress),
    [moonProgress]
  );

  // ── Moon data (permanent card, day or night) ───────────────────────────────
  const moonPhase = astronomy?.moonPhase ?? null;
  const moonPhaseName = astronomy?.phaseName ?? null;
  const moonIllumination = astronomy?.illumination ?? null;
  const moonrise = astronomy?.moonrise ?? null;
  const moonset = astronomy?.moonset ?? null;
  const nextFullMoon = astronomy?.nextFullMoon ?? null;

  const arcStroke = ARC_STROKE[phase] || '#4FA3D9';

  return (
    <section
      className="relative overflow-visible rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] motion-safe:animate-rise"
      style={{ animationDelay: "0s" }}
    >
      {/* Panel title */}
      <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold mb-1 flex items-center gap-2">
        {night ? <MoonIcon /> : <SunIcon />}
        {night ? t("sun.titleNight") : t("sun.title")}
      </div>

      {/* Arc and labels */}
      <div className="flex flex-col items-center">
        <svg
          viewBox="0 0 350 175"
          width="100%"
          style={{ marginTop: 8, overflow: 'visible' }}
          dir="ltr"
          role="img"
          aria-label={night ? "Moon position arc" : "Sun position arc"}
        >
          {/* ── Gradient/filter definitions used by the sun & moon bodies ── */}
          <SkyGradient />

          {/* ── Stars ── */}
          <StarField visible={starsVisible} />

          {/* ── Dashed track arc (always visible) ── */}
          <path
            d={SUN_ARC_BASE}
            stroke="var(--sun-arc-track)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />

          {/* ── Solid sky arc (color transitions with phase) ── */}
          <path
            d={SUN_ARC_BASE}
            stroke={arcStroke}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ transition: 'stroke 2.5s ease, opacity 2.5s ease', opacity: 0.45 }}
          />

          {/* ── Sun ── */}
          <SunBody
            cx={sunArcPoint.x}
            cy={sunArcPoint.y}
            color={sunColor}
            visible={!night}
          />

          {/* ── Moon (only while it's dark AND the moon is above the horizon) ── */}
          <MoonBody
            cx={moonArcPoint.x}
            cy={moonArcPoint.y}
            visible={night && moonIsUp}
            phase={moonPhase ?? 0}
            hemisphere={hemisphere}
          />

          {/* ── Horizon endpoint dots ── */}
          <circle cx="25"  cy="170" r="4" className="fill-muted" />
          <circle cx="325" cy="170" r="4" className="fill-muted" />
        </svg>

        {/* Sunrise / Sunset labels — explicitly LTR to match arc endpoints */}
        <div className="flex justify-between w-full mt-0.5" dir="ltr">
          <div className="text-left">
            <div className="text-[11px] text-muted uppercase tracking-[0.6px]">{t("sun.sunrise")}</div>
            <div className="font-mono text-[14px] font-medium mt-0.5">{Sunrise}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted uppercase tracking-[0.6px]">{t("sun.sunset")}</div>
            <div className="font-mono text-[14px] font-medium mt-0.5">{Sunset}</div>
          </div>
        </div>

        {/* ── Moon card — permanent, same data day or night ── */}
        <div className="mt-3.5 w-full relative" style={{ minHeight: 110 }}>
          <MoonCard
            moonPhase={moonPhase}
            moonPhaseName={moonPhaseName}
            illumination={moonIllumination}
            moonrise={moonrise}
            moonset={moonset}
            nextFullMoon={nextFullMoon}
            moonRaw={moonRaw}
            hemisphere={hemisphere}
            timezoneOffset={timezone_offset}
          />
        </div>
      </div>
    </section>
  );
};

export default SunPositionPanel;
