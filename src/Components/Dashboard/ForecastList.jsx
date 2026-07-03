import moment from "moment";

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </svg>
);

const ForecastList = ({ weatherData }) => {
  const { daily, timezone_offset } = weatherData;
  const forecastDays = daily.slice(0, 7);
  const forecastTitle =
    forecastDays.length === 7 ? "7-Day Forecast" : `${forecastDays.length}-Day Forecast`;

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

      {/* Forecast grid — horizontal scroll on desktop, wrapping below */}
      <div
        className="mt-3 flex-1 min-h-0 grid gap-2.5 w-full items-stretch justify-stretch overflow-x-auto pb-2
                   [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full
                   max-desktop:flex max-desktop:flex-wrap max-desktop:overflow-x-visible max-desktop:pb-0"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, forecastDays.length)}, minmax(110px, 1fr))`,
        }}
      >
        {forecastDays.map((day) => {
          const { weather, temp, dt, pop, humidity, wind_speed } = day;
          const { icon, main, description } = weather[0];
          const dayLabel = moment
            .unix(dt)
            .utcOffset(timezone_offset / 3600)
            .format("ddd, MMM DD");
          const windKmh = Number.isFinite(wind_speed)
            ? Math.round(wind_speed * 3.6)
            : null;

          return (
            <div
              key={dt}
              className="bg-white/[0.035] border border-panel-line rounded-card p-[12px_12px_10px] flex flex-col gap-2 min-w-0 w-full max-w-none flex-1 box-border self-stretch
                         max-desktop:flex-[0_0_calc(50%-5px)] max-desktop:min-h-[180px]
                         max-mobile:flex-[0_0_100%]"
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <div className="text-[13px] font-semibold leading-[1.2]">{dayLabel}</div>
                  <div className="text-[12px] text-muted capitalize">{main}</div>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  alt={description}
                  className="w-10 h-10 shrink-0"
                />
              </div>

              {/* Temp high / low */}
              <div className="font-mono text-[16px] font-semibold">
                <span>{temp.max}°</span>{" "}
                <span className="text-muted font-normal">/ {temp.min}°</span>
              </div>

              {/* Meta rows */}
              <div className="grid gap-[5px] mt-auto">
                <div className="flex justify-between gap-1.5 text-[11px] text-muted whitespace-nowrap">
                  <span>Precip</span>
                  <b className="text-primary font-mono font-medium">{pop ?? 0}%</b>
                </div>
                <div className="flex justify-between gap-1.5 text-[11px] text-muted whitespace-nowrap">
                  <span>Humidity</span>
                  <b className="text-primary font-mono font-medium">
                    {Number.isFinite(humidity) ? `${humidity}%` : "--"}
                  </b>
                </div>
                <div className="flex justify-between gap-1.5 text-[11px] text-muted whitespace-nowrap">
                  <span>Wind</span>
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
