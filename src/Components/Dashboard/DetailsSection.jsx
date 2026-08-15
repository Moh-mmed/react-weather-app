import { useTranslation } from "react-i18next";
import { useUnit } from "../../contexts/UnitContext";
import { getDewPoint } from "../../helpers/getDewPoint";
import { calculatePressureTrend } from "../../helpers/calculatePressureTrend";
import { normalizeWindSpeed } from "../../helpers/openWeatherAdapter";
import {
  CARD_BASE,
  CardHeader,
  StatusPill,
  UNIT_CLASS,
  VALUE_CLASS,
} from "./metricCardShared";

// Sub-components
import UvIndexCard from "./UvIndexCard";
import VisibilityCard from "./VisibilityCard";
import WindCard from "./WindCard";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const PressureCard = ({
  value,
  unit,
  status,
  trendText,
  unitSystem,
  animationDelay,
}) => {
  const { t } = useTranslation();
  const VB_W = 200;
  const VB_H = 145;
  const cx = 100;
  const cy = 75;
  const r = 52;
  const strokeWidth = 8;

  const startAngle = 150;
  const endAngle = 390;
  const angleSpan = endAngle - startAngle;

  const isImperial = unitSystem === "imperial";
  const minPressure = isImperial ? 28.35 : 960;
  const maxPressure = isImperial ? 31.3 : 1060;

  const numValue = Number(value);
  const hasPressure = Number.isFinite(numValue);
  const clampedVal = hasPressure
    ? clamp(numValue, minPressure, maxPressure)
    : null;
  const percentage = hasPressure
    ? (clampedVal - minPressure) / (maxPressure - minPressure)
    : 0;
  const currentAngle = startAngle + percentage * angleSpan;

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fillPath =
    percentage > 0.001 ? describeArc(cx, cy, r, startAngle, currentAngle) : "";

  const numTicks = 51;
  const ticks = [];
  for (let i = 0; i < numTicks; i++) {
    const angle = startAngle + (i / (numTicks - 1)) * angleSpan;
    const start = polarToCartesian(cx, cy, r + 6, angle);
    const end = polarToCartesian(cx, cy, r + 11, angle);
    ticks.push({ start, end });
  }

  const pillClassName =
    status === "Rising"
      ? "bg-blue-50 text-blue-600 dark:bg-blue-400/12 dark:text-blue-300"
      : status === "Falling"
        ? "bg-orange-50 text-orange-600 dark:bg-orange-400/12 dark:text-orange-300"
        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300";

  return (
    <div
      className={`${CARD_BASE} metric-card--pressure`}
      style={{ animationDelay }}
    >
      <CardHeader
        label={t("stats.pressure")}
        icon={
          <svg
            viewBox="0 0 24 24"
            className="h-[17px] w-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 14a7 7 0 0 1 14 0" />
            <path d="M7.8 8.9 6.4 7.5" />
            <path d="M12 7V4.9" />
            <path d="m16.2 8.9 1.4-1.4" />
            <path d="m12 14 3.8-3.4" />
            <circle cx="12" cy="14" r="1.35" />
          </svg>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Zone B & C: Value & Trend Text */}
        <div className="mt-[clamp(0.8rem,1.8vh,1.25rem)]">
          <div className="flex items-baseline gap-1.5">
            <span className={VALUE_CLASS}>{value}</span>
            <span className={UNIT_CLASS}>{unit}</span>
          </div>
          <div className="mt-2 text-[clamp(0.82rem,1vw,0.95rem)] font-bold text-[#0F2338] dark:text-[#F5F8FB]">
            {trendText}
          </div>
        </div>

        {/* Zone D: Dial Gauge Visualization */}
        <div className="relative mt-[clamp(0.7rem,1.6vh,1.1rem)] flex min-h-[6.5rem] flex-1 items-center justify-center pb-[clamp(0.4rem,0.8vh,0.7rem)]">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full max-w-[190px] h-auto overflow-visible"
            role="img"
            aria-label={t("stats.pressureDialAria", { value, unit })}
          >
            {/* Unfilled track arc */}
            <path
              d={trackPath}
              fill="none"
              style={{ fill: "none" }}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="text-[#E5EDF6] dark:text-white/[0.08]"
            />

            {/* Filled portion of arc */}
            {fillPath && (
              <path
                d={fillPath}
                fill="none"
                style={{ fill: "none" }}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-[#3B82F6] dark:text-[#FFFFFF]"
              />
            )}

            {/* Radial tick marks */}
            {ticks.map((tick, index) => (
              <line
                key={index}
                x1={tick.start.x}
                y1={tick.start.y}
                x2={tick.end.x}
                y2={tick.end.y}
                stroke="currentColor"
                strokeWidth="1.25"
                className="text-[#A9B8C7]/40 dark:text-white/20"
              />
            ))}

            {/* Center Value Text */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              className="fill-[#0F2338] dark:fill-[#F5F8FB] font-display text-[20px] font-bold"
            >
              {value}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="fill-[#8795A5] dark:fill-[#A9B8C7] font-sans text-[9px] font-semibold tracking-wider uppercase"
            >
              {unit}
            </text>
          </svg>
        </div>
      </div>

      <StatusPill
        status={status ? t(`stats.${status.toLowerCase()}`) : null}
        className={pillClassName}
      />
    </div>
  );
};

const getHumidityBand = (humidity) => {
  if (!Number.isFinite(humidity)) {
    return {
      headingKey: "weatherStatus.na",
      statusKey: null,
      descriptionKey: "weatherStatus.humidity.descriptions.na",
      headingColor: "#8795A5",
      gaugeColor: ["#C7D2DE", "#8795A5"],
      pillClassName:
        "bg-[#E7EDF4] text-[#8795A5] dark:bg-white/10 dark:text-[#A9B8C7]",
    };
  }

  if (humidity < 35) {
    return {
      headingKey: "weatherStatus.humidity.headings.veryDry",
      statusKey: "weatherStatus.humidity.pills.dry",
      descriptionKey: "weatherStatus.humidity.descriptions.dry",
      headingColor: "#E16D47",
      gaugeColor: ["#67E9FB", "#38BDF8"],
      pillClassName:
        "bg-red-50 text-[#D95D43] dark:bg-[#E2694A]/12 dark:text-[#FF9A82]",
    };
  }

  if (humidity <= 65) {
    return {
      headingKey: "weatherStatus.humidity.headings.comfortable",
      statusKey: "weatherStatus.humidity.pills.comfortable",
      descriptionKey: "weatherStatus.humidity.descriptions.comfortable",
      headingColor: "#22C55E",
      gaugeColor: ["#6EE7B7", "#22C55E"],
      pillClassName:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300",
    };
  }

  if (humidity <= 85) {
    return {
      headingKey: "weatherStatus.humidity.headings.humid",
      statusKey: "weatherStatus.humidity.pills.humid",
      descriptionKey: "weatherStatus.humidity.descriptions.humid",
      headingColor: "#F4A93B",
      gaugeColor: ["#FDE68A", "#F59E0B"],
      pillClassName:
        "bg-amber-50 text-[#D98916] dark:bg-[#F4A93B]/14 dark:text-[#FFD089]",
    };
  }

  return {
    headingKey: "weatherStatus.humidity.headings.saturated",
    statusKey: "weatherStatus.humidity.pills.sticky",
    descriptionKey: "weatherStatus.humidity.descriptions.saturated",
    headingColor: "#D98916",
    gaugeColor: ["#FCD34D", "#D97706"],
    pillClassName:
      "bg-amber-50 text-[#D98916] dark:bg-[#F4A93B]/14 dark:text-[#FFD089]",
  };
};

const HumidityCard = ({ humidity, band, animationDelay }) => {
  const { t } = useTranslation();
  // A genuine 0% is a valid reading; only non-finite input is missing. The
  // value, gauge and status all derive from this single finite check so the
  // card never fabricates a 0% when humidity is unavailable.
  const hasHumidity = Number.isFinite(humidity);
  const fill = hasHumidity ? clamp(humidity, 0, 100) : null;

  // Radial progress ring geometry — significantly larger gauge
  const GAUGE_SIZE = 124;
  const GAUGE_R = 47;
  const GAUGE_SW = 6;
  const CIRC = 2 * Math.PI * GAUGE_R;
  const dashOffset = hasHumidity ? CIRC * (1 - fill / 100) : CIRC;

  return (
    <div
      className={`${CARD_BASE} metric-card--humidity`}
      style={{ animationDelay }}
    >
      {/* ── Header: shared CardHeader, icon circle identical to Pressure ── */}
      <CardHeader
        label={t("stats.humidity")}
        iconBg="bg-[#E6F9FB]"
        iconColor="text-[#2fb7c8]"
        iconBgDark="dark:bg-[#2fb7c8]/12"
        icon={
          <svg
            viewBox="0 0 24 24"
            className="h-[17px] w-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3.25s6 6.75 6 11.15a6 6 0 0 1-12 0C6 10 12 3.25 12 3.25Z" />
          </svg>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── 1. Value — same typography as Pressure ── */}
        <div className="mt-[clamp(0.8rem,1.8vh,1.25rem)]">
          <div className="flex items-baseline gap-1.5">
            <span className={VALUE_CLASS}>
              {hasHumidity ? Math.round(fill) : "--"}
            </span>
            <span className={UNIT_CLASS}>%</span>
          </div>
        </div>

        {/* ── 2. Gauge + heading/description ── */}
        <div className="mt-[clamp(0.9rem,1.8vh,1.25rem)] flex flex-1 items-center gap-[clamp(0.85rem,1.7vw,1.4rem)]">
          <div className="flex flex-shrink-0 flex-col items-center">
            <div
              className="relative"
              style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}
            >
              <svg
                viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
                width={GAUGE_SIZE}
                height={GAUGE_SIZE}
                role="img"
                aria-label={t("stats.humidityGaugeAria", {
                  value: hasHumidity
                    ? `${Math.round(fill)}%`
                    : t("weatherStatus.na"),
                })}
                className="overflow-visible"
              >
                {/* Track ring */}
                <circle
                  cx={GAUGE_SIZE / 2}
                  cy={GAUGE_SIZE / 2}
                  r={GAUGE_R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={GAUGE_SW}
                  className="text-[#E8F4FB] dark:text-white/[0.07]"
                />

                {/* Flat progress ring */}
                <circle
                  cx={GAUGE_SIZE / 2}
                  cy={GAUGE_SIZE / 2}
                  r={GAUGE_R}
                  fill="none"
                  stroke={hasHumidity ? band.gaugeColor[1] : "#8795A5"}
                  strokeWidth={GAUGE_SW}
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />

                {/* Centre: % reading + RH label */}
                <text
                  x={GAUGE_SIZE / 2}
                  y={GAUGE_SIZE / 2 - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    fill: "var(--text-primary)",
                  }}
                >
                  {hasHumidity ? `${Math.round(fill)}%` : "--"}
                </text>
                <text
                  x={GAUGE_SIZE / 2}
                  y={GAUGE_SIZE / 2 + 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "8.5px",
                    fontWeight: "600",
                    fill: "var(--text-muted)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("stats.rh")}
                </text>
              </svg>
            </div>
          </div>

          {/* ── 4 & 5. Heading + Description — beside gauge, balanced column ── */}
          <div className="min-w-0">
            <div
              className="text-[clamp(0.98rem,1.25vw,1.15rem)] font-bold leading-tight"
              style={{ color: band.headingColor }}
            >
              {t(band.headingKey)}
            </div>
            <div className="mt-1.5 max-w-[10rem] text-[clamp(0.76rem,0.95vw,0.86rem)] font-medium leading-snug text-[#718195] dark:text-[#A9B8C7]">
              {t(band.descriptionKey)}
            </div>
          </div>
        </div>
      </div>

      <StatusPill
        status={band.statusKey ? t(band.statusKey) : null}
        className={band.pillClassName}
      />
    </div>
  );
};

const getDewPointBand = (dewPointC) => {
  if (!Number.isFinite(dewPointC)) {
    return {
      headingKey: "weatherStatus.na",
      statusKey: null,
      descriptionKey: "weatherStatus.dewPoint.descriptions.na",
      key: "",
      headingClassName: "text-[#8795A5] dark:text-[#A9B8C7]",
      pillClassName:
        "bg-[#E7EDF4] text-[#8795A5] dark:bg-white/10 dark:text-[#A9B8C7]",
    };
  }

  if (dewPointC < 10) {
    return {
      headingKey: "weatherStatus.dewPoint.headings.feelsDry",
      statusKey: "weatherStatus.dewPoint.headings.feelsDry",
      descriptionKey: "weatherStatus.dewPoint.descriptions.dry",
      key: "Dry",
      headingClassName: "text-[#2FB7C8]",
      pillClassName:
        "bg-cyan-50 text-[#1597AA] dark:bg-cyan-400/12 dark:text-cyan-200",
    };
  }

  if (dewPointC <= 16) {
    return {
      headingKey: "weatherStatus.dewPoint.headings.comfortable",
      statusKey: "weatherStatus.dewPoint.headings.comfortable",
      descriptionKey: "weatherStatus.dewPoint.descriptions.comfortable",
      key: "Comfortable",
      headingClassName: "text-emerald-500 dark:text-emerald-400",
      pillClassName:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300",
    };
  }

  return {
    headingKey: "weatherStatus.dewPoint.headings.feelsMuggy",
    statusKey: "weatherStatus.dewPoint.headings.feelsMuggy",
    descriptionKey: "weatherStatus.dewPoint.descriptions.muggy",
    key: "Muggy",
    headingClassName: "text-[#E2694A]",
    pillClassName:
      "bg-red-50 text-[#D95D43] dark:bg-[#E2694A]/12 dark:text-[#FF9A82]",
  };
};

const DewPointCard = ({ value, unit, dewPointC, band, animationDelay }) => {
  const { t } = useTranslation();
  const hasDewPoint = Number.isFinite(dewPointC);
  const markerTop = hasDewPoint
    ? clamp(((26 - dewPointC) / 26) * 100, 0, 100)
    : null;
  const scaleLabels = [
    { label: "Muggy", key: "muggy", top: "10%" },
    { label: "Comfortable", key: "comfortable", top: "50%" },
    { label: "Dry", key: "dry", top: "90%" },
  ];

  return (
    <div className={`${CARD_BASE} metric-card--dew`} style={{ animationDelay }}>
      <CardHeader
        label={t("stats.dewPoint")}
        iconBg="bg-[#E6F9FB]"
        iconColor="text-[#2fb7c8]"
        iconBgDark="dark:bg-[#2fb7c8]/12"
        icon={
          <svg
            viewBox="0 0 24 24"
            className="h-[17px] w-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v9.25" />
            <circle
              cx="12"
              cy="16"
              r="4.6"
              fill="currentColor"
              opacity="0.16"
            />
            <circle cx="12" cy="16" r="4.6" />
            <circle cx="12" cy="3.8" r="2.1" />
          </svg>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mt-[clamp(0.8rem,1.8vh,1.25rem)]">
          <div className="flex items-baseline gap-1.5">
            <span className={VALUE_CLASS}>{value}</span>
            <span className={UNIT_CLASS}>{unit}</span>
          </div>
        </div>

        <div className="mt-[clamp(0.9rem,1.8vh,1.25rem)] grid min-h-0 flex-1 grid-cols-[0.9fr_1.1fr] items-center gap-[clamp(0.85rem,1.8vw,1.35rem)]">
          <div className="min-w-0">
            <div
              className={`text-[clamp(0.98rem,1.25vw,1.15rem)] font-bold leading-tight ${band.headingClassName}`}
            >
              {t(band.headingKey)}
            </div>
            <div className="mt-1.5 max-w-[10rem] text-[clamp(0.76rem,0.95vw,0.86rem)] font-medium leading-snug text-[#718195] dark:text-[#A9B8C7]">
              {t(band.descriptionKey)}
            </div>
          </div>

          <div className="grid min-h-[5.4rem] grid-cols-[1.15rem_1fr] items-center gap-2.5">
            <div className="relative mx-auto h-[min(7.6rem,100%)] min-h-[5.4rem] w-[1.15rem] rounded-full bg-gradient-to-b from-[#E2694A] via-[#B9D95A] to-[#28BFD0] shadow-[inset_0_0_0_1px_rgba(15,35,56,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]">
              {markerTop !== null && (
                <span
                  className="absolute left-1/2 h-[0.9rem] w-[0.9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-white shadow-[0_4px_13px_rgba(15,35,56,0.20)] dark:border-[#DCEEFF] dark:bg-[#13273D]"
                  style={{ top: `${markerTop}%` }}
                />
              )}
            </div>

            <div className="relative h-[min(7.6rem,100%)] min-h-[5.4rem]">
              {scaleLabels.map((item) => {
                const active = item.label === band.key;
                return (
                  <div
                    key={item.label}
                    className="absolute left-0 flex w-full -translate-y-1/2 items-center gap-2"
                    style={{ top: item.top }}
                  >
                    <span className="h-px w-4 border-t border-dashed border-[#B7C3D0] dark:border-white/25" />
                    <span
                      className={
                        active
                          ? "text-[11px] font-bold text-[#0F2338] dark:text-[#F5F8FB]"
                          : "text-[11px] font-medium text-[#92A0AF] dark:text-[#8FA2B5]"
                      }
                    >
                      {t(`weatherStatus.dewPoint.scale.${item.key}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <StatusPill
        status={band.statusKey ? t(band.statusKey) : null}
        className={band.pillClassName}
      />
    </div>
  );
};

const DetailsSection = ({ page }) => {
  const { t } = useTranslation();
  const {
    convertTemp,
    convertWind,
    convertVisibility,
    convertPressure,
    unitSystem,
  } = useUnit();

  const { weatherData } = page;
  const { current, hourly } = weatherData;

  const { pressure, humidity, wind_speed, wind_deg, visibility, temp, uvi } =
    current;

  // ── 1. PRESSURE TREND ──
  // Current pressure: convertPressure yields "--" when the value is missing
  // (no fabricated replacement). The trend derives exclusively from REAL
  // chronological pressure samples — the current observation plus today's
  // real forecast samples, in the order returned by the adapter — never from
  // synthetic values. With fewer than 2 valid samples the trend is simply
  // unavailable (pill hidden, text "--").
  const presObj = convertPressure(pressure);
  const { direction: pressureDirection } = calculatePressureTrend(hourly);
  const pressureStatus = pressureDirection
    ? pressureDirection.charAt(0).toUpperCase() + pressureDirection.slice(1)
    : null;
  const pressureTrendText = pressureDirection
    ? t(`stats.${pressureDirection}`)
    : "--";

  // ── 2. HUMIDITY STATUS ──
  // The adapter already guarantees humidity is either a finite [0, 100] number
  // or null. Normalize once and feed the SAME value to every consumer so the
  // value, band and derived dew point can never diverge.
  const normalizedHumidity =
    Number.isFinite(humidity) && humidity >= 0 && humidity <= 100
      ? humidity
      : null;
  const humidityBand = getHumidityBand(normalizedHumidity);

  // ── 3. DEW POINT STATUS ──
  const dewPointC = getDewPoint(temp, normalizedHumidity);
  const dewPointDisplay = convertTemp(dewPointC);
  const dewPointBand = getDewPointBand(dewPointC);

  // ── 4. VISIBILITY ──
  const visObj = convertVisibility(visibility);
  const visKm = Number.isFinite(visibility) ? visibility / 1000 : null;

  // ── 5. WIND ──
  const windObj = convertWind(wind_speed);
  const gustMs = normalizeWindSpeed(current.wind?.gust);
  const sustainedWindIsMissing = !Number.isFinite(wind_speed);
  const gustObj =
    gustMs != null &&
    Number.isFinite(gustMs) &&
    (sustainedWindIsMissing || gustMs >= wind_speed)
      ? convertWind(gustMs)
      : null; // suppress gust display when API reports it below sustained wind speed (known OpenWeather data quirk)

  return (
    <div className="relative w-full animate-fadeIn select-none">
      {/* 6 Metric Cards in 3×2 grid */}
      <div className="grid grid-cols-1 gap-[clamp(0.55rem,1vw,1rem)] md:grid-cols-3 auto-rows-[360px]">
        {/* Card 1: Pressure */}
        <PressureCard
          value={presObj.value}
          unit={t(presObj.unitKey)}
          status={pressureStatus}
          trendText={pressureTrendText}
          unitSystem={unitSystem}
          animationDelay="0s"
        />

        {/* Card 2: Humidity */}
        <HumidityCard
          humidity={normalizedHumidity}
          band={humidityBand}
          animationDelay="0.05s"
        />

        {/* Card 3: Dew Point */}
        <DewPointCard
          value={dewPointDisplay}
          unit={unitSystem === "imperial" ? "°F" : "°C"}
          dewPointC={dewPointC}
          band={dewPointBand}
          animationDelay="0.1s"
        />

        {/* Card 4: UV Index */}
        <UvIndexCard uvi={uvi} animationDelay="0.15s" />

        {/* Card 5: Visibility */}
        <VisibilityCard
          value={visObj.value}
          unit={t(visObj.unitKey)}
          visKm={visKm}
          animationDelay="0.2s"
        />

        {/* Card 6: Wind */}
        <WindCard
          value={windObj.value}
          unit={t(windObj.unitKey)}
          windDeg={wind_deg}
          windSpeed={wind_speed}
          gust={gustObj}
          animationDelay="0.25s"
        />
      </div>
    </div>
  );
};

export default DetailsSection;
