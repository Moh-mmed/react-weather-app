const HeroPanel = ({ weatherData }) => {
  const { current, daily } = weatherData;
  const { temp, feels_like, weather } = current;
  const { description, icon } = weather[0];
  const today = daily[0];
  const high = today?.temp?.max;
  const low = today?.temp?.min;
  const displayTemp = Number.isFinite(temp) ? Math.round(temp) : "--";
  const displayFeels = Number.isFinite(feels_like)
    ? Math.round(feels_like)
    : "--";
  const displayHigh = Number.isFinite(high) ? high : "--";
  const displayLow = Number.isFinite(low) ? low : "--";

  return (
    <section
      className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] flex items-center justify-between gap-5 min-h-[190px] motion-safe:animate-rise"
      style={{ animationDelay: "0s" }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-10 -right-7 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(244,169,59,0.3), transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Left content */}
      <div className="flex flex-col gap-1.5 z-10">
        <div className="font-display italic text-[17px] text-accent-sky capitalize">
          {description}
        </div>
        <div
          className="font-display font-semibold leading-none tracking-[-2px]"
          style={{ fontSize: "clamp(64px, 8vw, 96px)" }}
        >
          {displayTemp}°
        </div>
        <div className="flex flex-wrap gap-[18px] mt-2">
          <span className="font-mono text-[13px] text-muted">
            Feels like <b className="text-primary font-medium">{displayFeels}°</b>
          </span>
          <span className="font-mono text-[13px] text-muted">
            High <b className="text-primary font-medium">{displayHigh}°</b> · Low{" "}
            <b className="text-primary font-medium">{displayLow}°</b>
          </span>
        </div>
      </div>

      {/* Weather icon */}
      <img
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt={description}
        className="w-[150px] h-[150px] opacity-95 z-10 shrink-0"
      />
    </section>
  );
};

export default HeroPanel;
