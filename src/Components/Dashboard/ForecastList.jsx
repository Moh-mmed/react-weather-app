import moment from "moment";

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </svg>
);

/**
 * Large decorative background glyph for the 7-Day Forecast panel.
 * Uses a calendar-plus-sun motif to echo the panel's purpose without
 * competing with the data. Opacity ~8–10%, pointer-events-none.
 *
 * The glyph style is chosen by the dominant weather condition across the
 * forecast days (majority-vote on icon code prefix).
 */
const ForecastBackgroundGlyph = ({ dominantCode, isNight }) => {
  const code = dominantCode ?? "01";

  if (code === "01") {
    return isNight ? (
      // Moon + stars
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
        <path
          d="M62 18C44 18 30 32 30 50C30 68 44 82 62 82C48 82 37 71 37 58C37 40 48 26 62 18Z"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="78" cy="22" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="85" cy="38" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="70" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) : (
      // Bright sun with wide rays
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
        <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="2.5" />
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="50" y1="8" x2="50" y2="20" />
          <line x1="50" y1="80" x2="50" y2="92" />
          <line x1="8" y1="50" x2="20" y2="50" />
          <line x1="80" y1="50" x2="92" y2="50" />
          <line x1="19" y1="19" x2="27" y2="27" />
          <line x1="73" y1="73" x2="81" y2="81" />
          <line x1="19" y1="81" x2="27" y2="73" />
          <line x1="73" y1="27" x2="81" y2="19" />
        </g>
      </svg>
    );
  }

  if (code === "02" || code === "03" || code === "04") {
    // Layered clouds
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
        <path
          d="M20 72C11 72 5 66 5 58C5 51 10 45 17 44C17 34 25 26 35 26C43 26 50 31 53 38C55 37 58 36 61 36C70 36 77 43 77 52C77 61 70 68 61 68"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M35 72C27 72 22 67 22 61C22 56 26 51 31 50C31 43 37 37 44 37C50 37 55 40 57 46C59 45 62 44 65 44C72 44 78 50 78 57C78 64 72 70 65 70"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M15 72H82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (code === "09" || code === "10") {
    // Rain drops falling from cloud
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
        <path
          d="M20 55C11 55 5 49 5 41C5 34 10 28 17 27C17 17 25 9 35 9C43 9 50 14 53 21C55 20 58 19 61 19C70 19 77 26 77 35C77 44 70 51 61 51H20Z"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="25" y1="62" x2="21" y2="74" />
          <line x1="41" y1="62" x2="37" y2="74" />
          <line x1="57" y1="62" x2="53" y2="74" />
          <line x1="33" y1="76" x2="29" y2="88" />
          <line x1="49" y1="76" x2="45" y2="88" />
          <line x1="65" y1="76" x2="61" y2="88" />
        </g>
      </svg>
    );
  }

  if (code === "11") {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
        <path
          d="M20 48C11 48 5 42 5 34C5 27 10 21 17 20C17 10 25 2 35 2C43 2 50 7 53 14C55 13 58 12 61 12C70 12 77 19 77 28C77 37 70 44 61 44H20Z"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M50 50L38 70H52L39 90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (code === "13") {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="22" y1="22" x2="78" y2="78" />
          <line x1="78" y1="22" x2="22" y2="78" />
          <line x1="50" y1="10" x2="40" y2="24" />
          <line x1="50" y1="10" x2="60" y2="24" />
          <line x1="50" y1="90" x2="40" y2="76" />
          <line x1="50" y1="90" x2="60" y2="76" />
          <line x1="10" y1="50" x2="24" y2="40" />
          <line x1="10" y1="50" x2="24" y2="60" />
          <line x1="90" y1="50" x2="76" y2="40" />
          <line x1="90" y1="50" x2="76" y2="60" />
        </g>
      </svg>
    );
  }

  // Default / mist / haze — horizontal wave lines
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="pointer-events-none select-none w-[130px] h-[130px]">
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10 30 Q25 22 40 30 Q55 38 70 30 Q80 24 92 30" />
        <path d="M10 46 Q25 38 40 46 Q55 54 70 46 Q80 40 92 46" />
        <path d="M10 62 Q25 54 40 62 Q55 70 70 62 Q80 56 92 62" />
        <path d="M10 78 Q25 70 40 78 Q55 86 70 78 Q80 72 92 78" />
      </g>
    </svg>
  );
};

const ForecastList = ({ weatherData }) => {
  const { daily, timezone_offset } = weatherData;
  const forecastDays = daily.slice(0, 7);
  const forecastTitle =
    forecastDays.length === 7 ? "7-Day Forecast" : `${forecastDays.length}-Day Forecast`;

  // Determine dominant weather condition across the forecast days for the glyph
  const dominantCode = (() => {
    if (!forecastDays.length) return "01";
    const codeCounts = {};
    forecastDays.forEach((day) => {
      const c = day.weather?.[0]?.icon?.slice(0, 2) ?? "01";
      codeCounts[c] = (codeCounts[c] ?? 0) + 1;
    });
    return Object.entries(codeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "01";
  })();
  const isNightDominant = forecastDays.every((d) => d.weather?.[0]?.icon?.endsWith("n"));

  return (
    <section
      className="relative overflow-hidden desktop:overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] min-h-0 flex flex-col motion-safe:animate-rise"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Panel title */}
      <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold mb-1 flex items-center gap-2">
        <CalendarIcon />
        {forecastTitle}
      </div>

      {/* ── Decorative background glyph ──────────────────────────────────── */}
      {/* Bottom-right, ~8% opacity — textural accent only, never competes with data. */}
      <div
        aria-hidden="true"
        className="absolute bottom-2 right-3 pointer-events-none text-accent-sun opacity-[0.08]"
      >
        <ForecastBackgroundGlyph dominantCode={dominantCode} isNight={isNightDominant} />
      </div>

      {/* Forecast grid — horizontal scroll on desktop, wrapping below */}
      <div
        className="mt-3 flex-1 min-h-0 grid gap-2.5 w-full items-stretch justify-stretch overflow-x-auto overflow-y-hidden pb-4
                   [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full
                   max-desktop:flex max-desktop:flex-col max-desktop:overflow-x-visible max-desktop:overflow-y-visible max-desktop:pb-0"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, forecastDays.length)}, minmax(110px, 1fr))`,
        }}
      >
        {forecastDays.map((day, index) => {
          const { weather, temp, dt, pop, humidity, wind_speed } = day;
          const { icon, main, description } = weather[0];
          const dayLabel = moment
            .unix(dt)
            .utcOffset(timezone_offset / 3600)
            .format("ddd, MMM DD");
          const windKmh = Number.isFinite(wind_speed)
            ? Math.round(wind_speed * 3.6)
            : null;

          let trendIcon = null;
          if (index > 0) {
            const prevHigh = forecastDays[index - 1].temp.max;
            const diff = temp.max - prevHigh;
            if (diff > 1) {
              trendIcon = (
                <svg viewBox="0 0 24 24" fill="none" stroke="#E2694A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 inline-block ml-0.5 relative -top-[1px]">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              );
            } else if (diff < -1) {
              trendIcon = (
                <svg viewBox="0 0 24 24" fill="none" stroke="#4FA3D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 inline-block ml-0.5 relative -top-[1px]">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              );
            }
          }

          return (
            <div
              key={dt}
              className="bg-white/[0.035] border border-panel-line rounded-card p-[10px_10px_8px] flex flex-col gap-1 min-w-0 w-full max-w-none flex-1 box-border self-stretch
                         max-desktop:flex-row max-desktop:items-center max-desktop:justify-between max-desktop:p-[8px_16px] max-desktop:gap-4"
            >
              {/* Card top: Day text + Icon */}
              <div className="flex items-start justify-between gap-2 w-full max-desktop:w-auto max-desktop:items-center max-desktop:gap-3">
                <div>
                  <div className="text-[12.5px] font-semibold leading-[1.2]">{dayLabel}</div>
                  <div className="text-[11px] text-muted capitalize leading-[1.2] max-desktop:hidden">{main}</div>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt={description}
                  className="w-8 h-8 shrink-0"
                />
              </div>

              {/* Temp high / low */}
              <div className="font-mono text-[14px] font-semibold leading-[1.2] max-desktop:flex-1 max-desktop:text-center flex items-center max-desktop:justify-center">
                <span className="flex items-center">{temp.max}°{trendIcon}</span>
                <span className="text-muted font-normal ml-1">/ {temp.min}°</span>
              </div>

              {/* Meta rows */}
              <div className="grid gap-[2px] mt-auto max-desktop:mt-0 max-desktop:flex max-desktop:items-center max-desktop:gap-5 max-desktop:flex-none">
                <div className="flex justify-between gap-1.5 text-[10px] text-muted whitespace-nowrap max-desktop:flex-col max-desktop:gap-0 max-desktop:items-end">
                  <span className="max-desktop:text-[9px] max-desktop:opacity-85">Precip</span>
                  <b className="text-primary font-mono font-medium">{pop ?? 0}%</b>
                </div>
                <div className="flex justify-between gap-1.5 text-[10px] text-muted whitespace-nowrap max-desktop:flex-col max-desktop:gap-0 max-desktop:items-end">
                  <span className="max-desktop:text-[9px] max-desktop:opacity-85">Humidity</span>
                  <b className="text-primary font-mono font-medium">
                    {Number.isFinite(humidity) ? `${humidity}%` : "--"}
                  </b>
                </div>
                <div className="flex justify-between gap-1.5 text-[10px] text-muted whitespace-nowrap max-desktop:flex-col max-desktop:gap-0 max-desktop:items-end">
                  <span className="max-desktop:text-[9px] max-desktop:opacity-85">Wind</span>
                  <b className="text-primary font-mono font-medium">
                    {Number.isFinite(windKmh) ? `${windKmh} km/h` : "--"}
                  </b>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ForecastList;
