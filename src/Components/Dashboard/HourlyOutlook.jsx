import clsx from "clsx";
import { formatHour24 } from "../../helpers/timeFormat";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const HourlyOutlook = ({ weatherData }) => {
  const { outlook48h, timezone_offset } = weatherData;

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

      {/* Hourly scroll row */}
      <div className="flex gap-1.5 overflow-x-auto pt-3.5 pb-1 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
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
