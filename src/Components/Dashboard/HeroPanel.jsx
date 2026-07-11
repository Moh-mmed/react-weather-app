import { useState, useEffect } from "react";
import clsx from "clsx";

const HeroPanel = ({ weatherData, isPinned = true, onRemove }) => {
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

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => {
      setConfirmDelete(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

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

      {/* Remove Button for Saved Locations */}
      {!isPinned && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirmDelete) {
                onRemove();
              } else {
                setConfirmDelete(true);
              }
            }}
            className={clsx(
              "px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-150 flex items-center gap-1.5 shadow-md cursor-pointer",
              confirmDelete
                ? "bg-accent-coral text-white hover:bg-red-600 border border-transparent"
                : "bg-white/10 hover:bg-white/20 text-muted hover:text-primary border border-white/5"
            )}
            onMouseLeave={() => setConfirmDelete(false)}
          >
            {confirmDelete ? (
              <span>Confirm delete?</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      )}

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
