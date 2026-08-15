import { useTranslation } from "react-i18next";
import {
  getWindDirectionAbbr,
  getWindDirectionCardinal,
} from "../../helpers/getWindDirection";
import {
  CARD_BASE,
  CardHeader,
  StatusPill,
  UNIT_CLASS,
  VALUE_CLASS,
} from "./metricCardShared";

const polarPoint = (cx, cy, radius, angleDeg) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.sin(rad), y: cy - radius * Math.cos(rad) };
};

const WIND_PILL =
  "bg-[#EAF6FE] text-[#2E7FB5] dark:bg-[#4FA3D9]/12 dark:text-[#8CCCF2]";

const getWindBand = (speedMs) => {
  if (!Number.isFinite(speedMs) || speedMs < 0) return null;
  if (speedMs < 1) return "weatherStatus.wind.pills.calm";
  if (speedMs < 5) return "weatherStatus.wind.pills.lightBreeze";
  if (speedMs < 11) return "weatherStatus.wind.pills.moderateBreeze";
  return "weatherStatus.wind.pills.strongWind";
};

const primaryTicks = [
  { label: "N", deg: 0 },
  { label: "E", deg: 90 },
  { label: "S", deg: 180 },
  { label: "W", deg: 270 },
];

const secondaryTicks = [45, 135, 225, 315];

const WindCard = ({
  value,
  unit,
  windDeg,
  windSpeed,
  gust,
  animationDelay,
}) => {
  const { t } = useTranslation();

  const hasDirection = Number.isFinite(windDeg);
  const safeDeg = hasDirection ? windDeg : null;
  const dirAbbr = getWindDirectionAbbr(safeDeg, t);
  const cardinal = getWindDirectionCardinal(safeDeg);
  const cardinalLabel =
    cardinal === "--"
      ? "--"
      : t(`windDirections.${cardinal}`, { defaultValue: cardinal });
  const bearing = hasDirection ? Math.round(windDeg) : "--";
  const band = getWindBand(windSpeed);

  const cx = 80;
  const cy = 80;
  const ringR = 52;

  return (
    <div
      className={`${CARD_BASE} metric-card--wind`}
      style={{ animationDelay }}
    >
      <CardHeader
        label={t("stats.wind")}
        iconBg="bg-[#EAF6FE]"
        iconColor="text-[#4FA3D9]"
        iconBgDark="dark:bg-[#4FA3D9]/12"
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
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2" />
          </svg>
        }
      />

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mt-[clamp(0.8rem,1.8vh,1.25rem)] grid min-h-0 flex-1 grid-cols-[1fr_1fr] gap-[clamp(0.7rem,1.4vw,1.15rem)]">
          {/* Compass rose */}
          <div className="grid min-h-0 place-items-center">
            <svg
              viewBox="0 0 160 160"
              className="metric-soft-appear aspect-square max-h-full w-[clamp(6.5rem,12vw,9.5rem)] overflow-visible"
              role="img"
              aria-label={t("stats.windDirectionAria", { abbr: dirAbbr, bearing })}
            >
              <circle
                cx={cx}
                cy={cy}
                r={ringR}
                fill="none"
                stroke="#C9D3DF"
                strokeWidth="1.5"
                className="dark:stroke-white/20"
              />

              {primaryTicks.map((tk) => {
                const outer = polarPoint(cx, cy, 58, tk.deg);
                const inner = polarPoint(cx, cy, 14, tk.deg);
                const labelPos = polarPoint(cx, cy, 71, tk.deg);
                return (
                  <g key={tk.label}>
                    <line
                      x1={inner.x}
                      y1={inner.y}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="#8A98A8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="dark:stroke-[#A9B8C7]"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-[#0F2338] text-[12px] font-bold dark:fill-[#F5F8FB]"
                    >
                      {t(`windDirections.${tk.label}`, {
                        defaultValue: tk.label,
                      })}
                    </text>
                  </g>
                );
              })}

              {secondaryTicks.map((deg) => {
                const outer = polarPoint(cx, cy, 50, deg);
                const inner = polarPoint(cx, cy, 28, deg);
                return (
                  <line
                    key={deg}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#B7C3D0"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="dark:stroke-white/30"
                  />
                );
              })}

              {safeDeg !== null && (
                <g transform={`rotate(${safeDeg} ${cx} ${cy})`}>
                  <path
                    d="M80 42 L92 92 L80 78 Z"
                    className="fill-[#5FA6DE] dark:fill-[#7FB7E8]"
                  />
                  <path
                    d="M80 42 L80 78 L68 92 Z"
                    className="fill-[#2F6FB3] dark:fill-[#3D7EC2]"
                  />
                </g>
              )}
              <circle
                cx={cx}
                cy={cy}
                r="4"
                className="fill-white stroke-[#2F6FB3] dark:fill-[#13273D] dark:stroke-[#5FA6DE]"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Value stack */}
          <div className="flex min-w-0 flex-col justify-center">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={VALUE_CLASS}>{value}</span>
                <span className={UNIT_CLASS}>{unit}</span>
              </div>
              <div className="mt-2 text-[clamp(0.85rem,1.1vw,1rem)] font-bold text-[#4FA3D9] dark:text-[#7CC0EC]">
                {dirAbbr}
              </div>
              <div className="mt-1 text-[clamp(0.72rem,0.9vw,0.82rem)] font-semibold text-[#8795A5] dark:text-[#A9B8C7]">
                {cardinalLabel} {bearing}°
              </div>
            </div>

            <div className="my-[clamp(0.6rem,1.2vh,0.9rem)] h-px w-full bg-[#E7EDF4] dark:bg-white/10" />

            {gust && (
              <div>
                <div className="text-[clamp(0.7rem,0.85vw,0.78rem)] font-semibold text-[#8795A5] dark:text-[#A9B8C7]">
                  {t("stats.gusts")}
                </div>
                <div className="mt-1 font-mono text-[clamp(0.88rem,1.1vw,1rem)] font-bold leading-none text-[#0F2338] dark:text-[#F5F8FB]">
                  {gust.value} {t(gust.unitKey)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StatusPill status={band ? t(band) : null} className={WIND_PILL} />
    </div>
  );
};

export default WindCard;
