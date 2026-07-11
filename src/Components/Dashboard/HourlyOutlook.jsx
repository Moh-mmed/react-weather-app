import clsx from "clsx";
import { formatHour24 } from "../../helpers/timeFormat";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
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
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
        <path
          d="M65 15C45 15 28 32 28 52C28 72 45 89 65 89C50 89 38 76 38 62C38 42 50 27 65 15Z"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </svg>
    ) : (
      // Sun
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
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
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
        <path
          d="M25 68C16 68 10 62 10 54C10 47 15 41 22 40C22 30 30 22 40 22C48 22 55 27 58 34C60 33 63 32 66 32C75 32 82 39 82 48C82 57 75 64 66 64"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M20 68H78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (code === "09" || code === "10") {
    // Rain — cloud + drops
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
        <path
          d="M25 58C16 58 10 52 10 44C10 37 15 31 22 30C22 20 30 12 40 12C48 12 55 17 58 24C60 23 63 22 66 22C75 22 82 29 82 38C82 47 75 54 66 54H25Z"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
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
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
        <path
          d="M25 50C16 50 10 44 10 36C10 29 15 23 22 22C22 12 30 4 40 4C48 4 55 9 58 16C60 15 63 14 66 14C75 14 82 21 82 30C82 39 75 46 66 46H25Z"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M55 50L42 68H56L43 88" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (code === "13") {
    // Snow — snowflake
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
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
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[120px] h-[120px]">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M15 35 Q30 28 45 35 Q60 42 75 35 Q82 31 90 35" />
        <path d="M15 50 Q30 43 45 50 Q60 57 75 50 Q82 46 90 50" />
        <path d="M15 65 Q30 58 45 65 Q60 72 75 65 Q82 61 90 65" />
      </g>
    </svg>
  );
};

const HourlyOutlook = ({ weatherData }) => {
  const { outlook48h, timezone_offset } = weatherData;

  // Derive icon for the background glyph from the first available hourly entry
  const glyphIcon = outlook48h?.[0]?.weather?.[0]?.icon ?? null;

  return (
    <section
      className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] motion-safe:animate-rise"
      style={{ animationDelay: "0.05s" }}
    >
      {/* Panel title */}
      <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold mb-1 flex items-center gap-2">
        <ClockIcon />
        48-Hour Outlook
      </div>

      {/* ── Decorative background glyph ──────────────────────────────────── */}
      {/* Positioned bottom-right; opacity ~10% so it reads as texture only. */}
      <div
        aria-hidden="true"
        className="absolute bottom-1 right-2 pointer-events-none text-accent-sky opacity-[0.09]"
      >
        <BackgroundGlyph icon={glyphIcon} />
      </div>

      {/* Hourly scroll row */}
      <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden pt-3.5 pb-2 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
        {outlook48h.length ? (
          outlook48h.map((entry) => {
            const label = `${formatHour24(entry.dt, timezone_offset)}:00`;
            const icon = entry.weather?.[0]?.icon ?? "01d";

            return (
              <div
                key={entry.dt}
                className={clsx(
                  "flex-none w-[74px] flex flex-col items-center gap-2 py-3 rounded-[14px] border",
                  entry.isInterpolated ? "opacity-70" : "opacity-100",
                  "bg-transparent border-transparent"
                )}
              >
                <div className="font-mono text-[11px] text-muted">{label}</div>
                <img
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt=""
                  className="w-[26px] h-[26px]"
                />
                <div className="font-mono text-[14px] font-medium">{Math.round(entry.temp)}°</div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center min-h-[116px] text-[12px] text-muted">
            48-hour hourly forecast requires OpenWeather One Call 3.0 access.
          </div>
        )}
      </div>
    </section>
  );
};

export default HourlyOutlook;
