import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { translateConditionDescription } from "../../helpers/weatherConditionTranslator";
import { useUnit } from "../../contexts/UnitContext";

/**
 * HeroPanel — current conditions card.
 */
const HeroPanel = ({ weatherData, isPinned = true, onRemove, cityPhoto }) => {
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
  const [photoLoaded, setPhotoLoaded] = useState(false);

  useEffect(() => {
    setPhotoLoaded(false);
  }, [cityPhoto?.url]);

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
      {/* ── City photo background layer ───────────────────────────────────── */}
      {cityPhoto?.url && (
        <>
          <img
            src={cityPhoto.url}
            alt=""
            aria-hidden="true"
            onLoad={() => setPhotoLoaded(true)}
            onError={() => setPhotoLoaded(false)}
            className={clsx(
              "absolute inset-0 w-full h-full object-cover pointer-events-none select-none",
              "transition-opacity duration-700",
              photoLoaded ? "opacity-65" : "opacity-0"
            )}
          />
          {photoLoaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, #13273D 0%, #13273Dcc 45%, #13273D88 70%, transparent 100%)",
              }}
            />
          )}
        </>
      )}

      {/* ── Glow orb (always present, on top of photo) ───────────────────── */}
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
                : "bg-white/10 hover:bg-white/20 text-muted hover:text-primary border border-white/5"
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
            {t("hero.high")} <b className="text-primary font-medium">{displayHigh}°</b> ·{" "}
            {t("hero.low")} <b className="text-primary font-medium">{displayLow}°</b>
          </span>
        </div>
      </div>

      {/* ── Weather icon (foreground, always visible) ─────────────────────── */}
      <img
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt={translatedDesc}
        className="w-[150px] h-[150px] opacity-95 z-10 shrink-0"
      />

      {/* ── Unsplash attribution ───────────────────────────────────────────── */}
      {cityPhoto?.url && photoLoaded && (
        <div className="absolute bottom-2 right-3 z-20 pointer-events-auto">
          <p className="font-mono text-[9px] text-white/30 leading-none">
            {t("hero.photoBy")}{" "}
            <a
              href={cityPhoto.photographerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-1 hover:text-white/55 transition-colors duration-150"
            >
              {cityPhoto.photographerName}
            </a>{" "}
            {t("hero.onUnsplash")}{" "}
            <a
              href={cityPhoto.unsplashLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-1 hover:text-white/55 transition-colors duration-150"
            >
              Unsplash
            </a>
          </p>
        </div>
      )}
    </section>
  );
};

export default HeroPanel;
