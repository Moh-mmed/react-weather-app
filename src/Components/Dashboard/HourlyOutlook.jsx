import { useTranslation } from "react-i18next";
import { formatHour24 } from "../../helpers/timeFormat";
import { useUnit } from "../../contexts/UnitContext";

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-3.5 h-3.5 opacity-85"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

/**
 * Large faint background glyph — a simplified wave/signal shape representing
 * the concept of "over time". Opacity kept very low (~10%) so it reads as
 * a textural accent rather than a data element, matching the sun-glow orb
 * treatment in the Hero panel.
 */
const BackgroundGlyph = ({ icon }) => {
  // Derive a broad condition category from the OWM icon code (e.g. "01d" → clear)
  // and render a matching decorative SVG glyph.
  const code = icon ? icon.slice(0, 2) : "01";
  const isNight = icon ? icon.endsWith("n") : false;

  if (code === "01") {
    // Clear sky — sun or moon
    return isNight ? (
      // Moon crescent
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none select-none w-[120px] h-[120px]"
      >
        <path
          d="M65 15C45 15 28 32 28 52C28 72 45 89 65 89C50 89 38 76 38 62C38 42 50 27 65 15Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ) : (
      // Sun
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none select-none w-[120px] h-[120px]"
      >
        <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" />
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="50" y1="10" x2="50" y2="22" />
          <line x1="50" y1="78" x2="50" y2="90" />
          <line x1="10" y1="50" x2="22" y2="50" />
          <line x1="78" y1="50" x2="90" y2="50" />
          <line x1="21" y1="21" x2="29" y2="29" />
          <line x1="71" y1="71" x2="79" y2="79" />
          <line x1="21" y1="79" x2="29" y2="71" />
          <line x1="71" y1="29" x2="79" y2="21" />
        </g>
      </svg>
    );
  }

  if (code === "02" || code === "03" || code === "04") {
    // Cloudy — cloud shape
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none select-none w-[120px] h-[120px]"
      >
        <path
          d="M25 68C16 68 10 62 10 54C10 47 15 41 22 40C22 30 30 22 40 22C48 22 55 27 58 34C60 33 63 32 66 32C75 32 82 39 82 48C82 57 75 64 66 64"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 68H78"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (code === "09" || code === "10") {
    // Rain — cloud + drops
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none select-none w-[120px] h-[120px]"
      >
        <path
          d="M25 58C16 58 10 52 10 44C10 37 15 31 22 30C22 20 30 12 40 12C48 12 55 17 58 24C60 23 63 22 66 22C75 22 82 29 82 38C82 47 75 54 66 54H25Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="30" y1="66" x2="26" y2="76" />
          <line x1="50" y1="66" x2="46" y2="76" />
          <line x1="70" y1="66" x2="66" y2="76" />
          <line x1="40" y1="78" x2="36" y2="88" />
          <line x1="60" y1="78" x2="56" y2="88" />
        </g>
      </svg>
    );
  }

  if (code === "11") {
    // Thunderstorm — lightning bolt
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none select-none w-[120px] h-[120px]"
      >
        <path
          d="M25 50C16 50 10 44 10 36C10 29 15 23 22 22C22 12 30 4 40 4C48 4 55 9 58 16C60 15 63 14 66 14C75 14 82 21 82 30C82 39 75 46 66 46H25Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M55 50L42 68H56L43 88"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (code === "13") {
    // Snow — snowflake
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none select-none w-[120px] h-[120px]"
      >
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="50" y1="15" x2="50" y2="85" />
          <line x1="15" y1="50" x2="85" y2="50" />
          <line x1="26" y1="26" x2="74" y2="74" />
          <line x1="74" y1="26" x2="26" y2="74" />
          <line x1="50" y1="15" x2="42" y2="27" />
          <line x1="50" y1="15" x2="58" y2="27" />
          <line x1="50" y1="85" x2="42" y2="73" />
          <line x1="50" y1="85" x2="58" y2="73" />
          <line x1="15" y1="50" x2="27" y2="42" />
          <line x1="15" y1="50" x2="27" y2="58" />
          <line x1="85" y1="50" x2="73" y2="42" />
          <line x1="85" y1="50" x2="73" y2="58" />
        </g>
      </svg>
    );
  }

  // Default / mist / haze / fog — wave lines
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none select-none w-[120px] h-[120px]"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M15 35 Q30 28 45 35 Q60 42 75 35 Q82 31 90 35" />
        <path d="M15 50 Q30 43 45 50 Q60 57 75 50 Q82 46 90 50" />
        <path d="M15 65 Q30 58 45 65 Q60 72 75 65 Q82 61 90 65" />
      </g>
    </svg>
  );
};

const HourlyOutlook = ({ weatherData }) => {
  const { t } = useTranslation();
  const { convertTemp } = useUnit();
  const { outlook48h, timezone_offset } = weatherData;

  const glyphIcon = outlook48h?.[0]?.weather?.[0]?.icon ?? null;

  // Layout constants
  const COLUMN_WIDTH = 72;
  const SVG_HEIGHT = 140;
  const PADDING_Y = 45;
  const INNER_HEIGHT = SVG_HEIGHT - PADDING_Y * 2;

  const temps = outlook48h?.map((d) => convertTemp(d.temp)) || [];
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  const points =
    outlook48h?.map((d, i) => {
      const displayVal = convertTemp(d.temp);
      const x = i * COLUMN_WIDTH + COLUMN_WIDTH / 2;
      const normalized = (displayVal - minTemp) / range;
      const y = PADDING_Y + (1 - normalized) * INNER_HEIGHT;
      return { x, y };
    }) || [];

  const pathStr = points
    .map((p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1];
      // Smooth curve
      const cp1x = prev.x + (p.x - prev.x) / 2.5;
      const cp1y = prev.y;
      const cp2x = p.x - (p.x - prev.x) / 2.5;
      const cp2y = p.y;
      return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  const totalWidth = points.length
    ? points[points.length - 1].x + COLUMN_WIDTH / 2
    : 0;

  return (
    <section
      className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] motion-safe:animate-rise"
      style={{ animationDelay: "0.05s" }}
    >
      {/* Panel title */}
      <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold mb-4 flex items-center gap-2">
        <ClockIcon />
        {t("outlook.title")}
      </div>

      <div
        aria-hidden="true"
        className="absolute top-2 right-2 pointer-events-none text-accent-sky opacity-[0.09]"
      >
        <BackgroundGlyph icon={glyphIcon} />
      </div>

      {/* Scrollable area — force LTR for chronological timeline progression */}
      <div
        dir="ltr"
        className="overflow-x-auto overflow-y-hidden custom-scrollbar pb-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {outlook48h?.length ? (
          <div
            className="relative min-w-max mt-2"
            style={{ height: SVG_HEIGHT, width: totalWidth }}
          >
            {/* ── SVG Timeline Layer ── */}
            <svg
              width={totalWidth}
              height={SVG_HEIGHT}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient
                  id="temp-gradient"
                  x1="0"
                  y1={PADDING_Y}
                  x2="0"
                  y2={PADDING_Y + INNER_HEIGHT}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#FF7E47" /> {/* Warm Orange */}
                  <stop offset="100%" stopColor="#93A5BE" />{" "}
                  {/* Cool Blue-Grey */}
                </linearGradient>
              </defs>

              {/* Vertical Dashed Lines */}
              {points.map((p, i) => (
                <line
                  key={`dash-${i}`}
                  x1={p.x}
                  y1={24}
                  x2={p.x}
                  y2={SVG_HEIGHT - 30}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              ))}

              {/* Smooth Trend Line */}
              <path
                d={pathStr}
                fill="none"
                stroke="url(#temp-gradient)"
                strokeWidth="2.5"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              />

              {/* Data Dots */}
              {points.map((p, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="url(#temp-gradient)"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                />
              ))}
            </svg>

            {/* ── HTML Text Layer ── */}
            <div className="absolute inset-0 flex w-full h-full z-10">
              {outlook48h.map((entry, i) => {
                const label = `${formatHour24(entry.dt, timezone_offset)}:00`;
                return (
                  <div
                    key={entry.dt}
                    className="flex-none flex flex-col justify-between items-center py-1"
                    style={{ width: COLUMN_WIDTH }}
                  >
                    <div className="font-mono text-[11px] text-muted tracking-wide mt-1">
                      {label}
                    </div>
                    <div className="font-mono text-[17px] font-medium tracking-tight mb-1">
                      {convertTemp(entry.temp)}°
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center min-h-[140px] text-[12px] text-muted px-2">
            {t("outlook.fallbackMessage")}
          </div>
        )}
      </div>
    </section>
  );
};


export default HourlyOutlook;
