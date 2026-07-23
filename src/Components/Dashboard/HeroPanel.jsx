import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { translateConditionDescription } from "../../helpers/weatherConditionTranslator";
import { useUnit } from "../../contexts/UnitContext";

const cloudPath =
  "M25 68C16 68 10 62 10 54C10 47 15 41 22 40C22 30 30 22 40 22C48 22 55 27 58 34C60 33 63 32 66 32C75 32 82 39 82 48C82 57 75 64 66 64H25Z";

const range = (count) => Array.from({ length: count }, (_, i) => i);
const starPositions = [
  [8, 18],
  [18, 62],
  [29, 28],
  [39, 72],
  [51, 16],
  [61, 48],
  [72, 25],
  [84, 66],
  [12, 42],
  [46, 54],
  [76, 11],
  [91, 39],
];

const getHeroCondition = (current) => {
  const weather = current?.weather?.[0] || {};
  const code = weather.icon?.slice(0, 2);
  const main = weather.main?.toLowerCase() || "";
  const description = weather.description?.toLowerCase() || "";
  const isDay =
    Number.isFinite(current?.dt) &&
    Number.isFinite(current?.sunrise) &&
    Number.isFinite(current?.sunset)
      ? current.dt >= current.sunrise && current.dt < current.sunset
      : !weather.icon?.endsWith("n");

  if (code === "01" || main === "clear")
    return isDay ? "clear-day" : "clear-night";
  if (code === "02" || code === "03" || code === "04" || main === "clouds")
    return "clouds";
  if (
    code === "09" ||
    code === "10" ||
    main.includes("rain") ||
    main.includes("drizzle")
  )
    return "rain";
  if (code === "11" || main.includes("thunderstorm")) return "thunderstorm";
  if (code === "13" || main.includes("snow")) return "snow";
  if (
    code === "50" ||
    [
      "mist",
      "fog",
      "haze",
      "smoke",
      "dust",
      "sand",
      "ash",
      "squall",
      "tornado",
    ].some((term) => main.includes(term) || description.includes(term))
  ) {
    return "fog";
  }

  return isDay ? "clear-day" : "clear-night";
};

const CloudShape = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    aria-hidden="true"
    className={clsx("hero-cloud-shape", className)}
  >
    <path d={cloudPath} />
    <path d="M20 68H78" />
  </svg>
);

const HeroWeatherBackground = ({ current }) => {
  const condition = getHeroCondition(current);

  return (
    <div
      aria-hidden="true"
      className={clsx("hero-weather-bg", `hero-weather-bg--${condition}`)}
    >
      {(condition === "clear-day" || condition === "clear-night") && (
        <div className="hero-celestial">
          {condition === "clear-day" ? (
            <>
              <div className="hero-sun-glow" />
              <div className="hero-sun-rays" />
              <div className="hero-sun-core" />
            </>
          ) : (
            <>
              {range(12).map((i) => (
                <span
                  key={i}
                  className="hero-star"
                  style={{
                    "--i": i,
                    "--x": `${starPositions[i][0]}%`,
                    "--y": `${starPositions[i][1]}%`,
                    "--size": `${2 + (i % 3)}px`,
                  }}
                />
              ))}
              <div className="hero-moon" />
            </>
          )}
        </div>
      )}

      {["clouds", "rain", "thunderstorm"].includes(condition) && (
        <div className="hero-clouds">
          <CloudShape className="hero-cloud-shape--one" />
          <CloudShape className="hero-cloud-shape--two" />
          <CloudShape className="hero-cloud-shape--three" />
        </div>
      )}

      {["rain", "thunderstorm"].includes(condition) && (
        <div className="hero-rain">
          {range(24).map((i) => (
            <span
              key={i}
              className="hero-rain-drop"
              style={{
                "--i": i,
                "--x": `${(i * 41) % 100}%`,
                "--height": `${22 + (i % 4) * 6}px`,
                "--duration": `${0.82 + (i % 5) * 0.12}s`,
              }}
            />
          ))}
        </div>
      )}

      {condition === "thunderstorm" && <div className="hero-lightning-flash" />}

      {condition === "snow" && (
        <div className="hero-snow">
          {range(24).map((i) => (
            <span
              key={i}
              className="hero-snowflake"
              style={{
                "--i": i,
                "--x": `${(i * 37) % 100}%`,
                "--size": `${4 + (i % 3) * 2}px`,
                "--duration": `${6 + (i % 6) * 0.55}s`,
              }}
            />
          ))}
        </div>
      )}

      {condition === "fog" && (
        <div className="hero-fog">
          {range(6).map((i) => (
            <span key={i} className="hero-fog-band" style={{ "--i": i }} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * HeroPanel — current conditions card.
 */
const HeroPanel = ({ weatherData, isPinned = true, onRemove }) => {
  const { t } = useTranslation();
  const { convertTemp } = useUnit();
  const { current, daily } = weatherData;
  const { temp, feels_like, weather } = current;
  const { icon } = weather[0];
  const translatedDesc = translateConditionDescription(weather[0], t);
  const today = daily[0];
  const high = today?.temp?.max;
  const low = today?.temp?.min;
  const displayTemp = Number.isFinite(temp) ? convertTemp(temp) : "--";
  const displayFeels = Number.isFinite(feels_like)
    ? convertTemp(feels_like)
    : "--";
  const displayHigh = Number.isFinite(high) ? convertTemp(high) : "--";
  const displayLow = Number.isFinite(low) ? convertTemp(low) : "--";

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
      <HeroWeatherBackground current={current} />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "var(--hero-overlay)",
        }}
      />

      {/* ── Glow orb (always present, on top of animation) ───────────────── */}
      <div
        className="absolute -top-10 -right-7 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(244,169,59,0.3), transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* ── Remove Button for Saved Locations ────────────────────────────── */}
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
                : "bg-white/10 hover:bg-white/20 text-muted hover:text-primary border border-white/5",
            )}
            onMouseLeave={() => setConfirmDelete(false)}
          >
            {confirmDelete ? (
              <span>{t("hero.confirmDelete")}</span>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  width="11"
                  height="11"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>{t("hero.remove")}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Left content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 z-10">
        <div className="font-display italic text-[17px] text-accent-sky capitalize">
          {translatedDesc}
        </div>
        <div
          className="font-display font-semibold leading-none tracking-[-2px]"
          style={{ fontSize: "clamp(64px, 8vw, 96px)" }}
        >
          {displayTemp}°
        </div>
        <div className="flex flex-wrap gap-[18px] mt-2">
          <span className="font-mono text-[13px] text-muted">
            {t("hero.feelsLike")}{" "}
            <b className="text-primary font-medium">{displayFeels}°</b>
          </span>
          <span className="font-mono text-[13px] text-muted">
            {t("hero.high")}{" "}
            <b className="text-primary font-medium">{displayHigh}°</b> ·{" "}
            {t("hero.low")}{" "}
            <b className="text-primary font-medium">{displayLow}°</b>
          </span>
        </div>
      </div>

      {/* ── Weather icon (foreground, always visible) ─────────────────────── */}
      {/* <img
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt={translatedDesc}
        className="w-[150px] h-[150px] opacity-95 z-10 shrink-0"
      /> */}
    </section>
  );
};

export default HeroPanel;
