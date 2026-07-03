import getTiming from "../../helpers/getTiming";
import { getUviDescription } from "../../helpers/getUVI";
import { getSunArcPoint, SUN_ARC_BASE } from "../../helpers/sunArc";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
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
    <section
      className="relative overflow-visible rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] motion-safe:animate-rise"
      style={{ animationDelay: "0s" }}
    >
      {/* Panel title */}
      <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold mb-1 flex items-center gap-2">
        <SunIcon />
        Sun Position
      </div>

      {/* Arc and labels */}
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 350 175" width="100%" style={{ marginTop: 8 }}>
          {/* Dashed base arc */}
          <path
            d={SUN_ARC_BASE}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
          {/* Solid sky arc */}
          <path
            d={SUN_ARC_BASE}
            stroke="#4FA3D9"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Sun dot — dynamic position stays as SVG attributes */}
          {day && (
            <circle
              cx={arcPoint.x}
              cy={arcPoint.y}
              r="8"
              fill="#F4A93B"
              className="motion-safe:animate-pulseSun"
            />
          )}
          <circle cx="25" cy="170" r="4" fill="#8CA1B4" />
          <circle cx="325" cy="170" r="4" fill="#8CA1B4" />
        </svg>

        {/* Sunrise / Sunset labels */}
        <div className="flex justify-between w-full mt-0.5">
          <div className="text-left">
            <div className="text-[11px] text-muted uppercase tracking-[0.6px]">Sunrise</div>
            <div className="font-mono text-[14px] font-medium mt-0.5">{Sunrise}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted uppercase tracking-[0.6px]">Sunset</div>
            <div className="font-mono text-[14px] font-medium mt-0.5">{Sunset}</div>
          </div>
        </div>

        {/* UV Index chip */}
        <div className="mt-3.5 w-full flex items-start gap-3 bg-accent-coral/[0.12] border border-accent-coral/30 rounded-chip p-[14px_14px_18px] box-border">
          <div className="font-display font-semibold text-[24px] text-accent-coral">{UVI}</div>
          <div className="text-[12px] text-muted leading-[1.55] min-w-0">
            <b className="text-primary capitalize">{uviCopy.title}.</b> {uviCopy.description}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SunPositionPanel;
