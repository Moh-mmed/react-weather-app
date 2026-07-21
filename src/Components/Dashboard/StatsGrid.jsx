import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { getDewPoint } from "../../helpers/getDewPoint";
import { getWindDirectionAbbr } from "../../helpers/getWindDirection";

const StatIcon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-[18px] h-[18px] text-accent-sky opacity-90"
  >
    {children}
  </svg>
);

const StatsGrid = ({ weatherData }) => {
  const { t, i18n } = useTranslation();
  const trackRef = useRef(null);
  const scrollRafRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { current } = weatherData;
  const {
    pressure,
    humidity,
    wind_speed,
    wind_deg,
    visibility,
    temp,
    clouds,
  } = current;

  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLocale = rawLang === "fr" ? "fr-FR" : rawLang === "ar" ? "ar-EG" : "en-US";
  const numFormatter = new Intl.NumberFormat(activeLocale, { numberingSystem: "latn" });

  const dewPoint = getDewPoint(temp, humidity);
  const windKmh = Number.isFinite(wind_speed)
    ? Math.round(wind_speed * 3.6)
    : "--";
  const windDir = getWindDirectionAbbr(wind_deg, t);
  const visibilityKm = Number.isFinite(visibility)
    ? (visibility / 1000).toFixed(1)
    : "--";

  const stats = [
    {
      label: t("stats.pressure"),
      value: Number.isFinite(pressure) ? numFormatter.format(pressure) : "--",
      unit: t("stats.unitHpa"),
      icon: (
        <>
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M12 16l4-5" />
          <path d="M7 16h10" />
          <circle cx="12" cy="16" r="1" />
        </>
      ),
    },
    {
      label: t("stats.humidity"),
      value: Number.isFinite(humidity) ? humidity : "--",
      unit: "%",
      icon: <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" />,
    },
    {
      label: t("stats.wind"),
      value: Number.isFinite(windKmh) ? numFormatter.format(windKmh) : windKmh,
      unit: `${t("stats.unitKmH")} ${windDir}`,
      icon: (
        <>
          <path d="M3 8h11a3 3 0 1 0-3-3" />
          <path d="M3 16h14a3 3 0 1 1-3 3" />
        </>
      ),
    },
    {
      label: t("stats.visibility"),
      value: Number.isFinite(visibility) ? numFormatter.format((visibility / 1000).toFixed(1)) : visibilityKm,
      unit: t("stats.unitKm"),
      icon: (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ),
    },
    {
      label: t("stats.dewPoint"),
      value: Number.isFinite(dewPoint) ? dewPoint : "--",
      unit: "°C",
      icon: (
        <>
          <path d="M12 2v6M9 5l3 3 3-3" />
          <circle cx="12" cy="15" r="6" />
        </>
      ),
    },
    {
      label: t("stats.cloudCover"),
      value: Number.isFinite(clouds) ? clouds : "--",
      unit: "%",
      icon: (
        <path d="M6 17a4 4 0 1 1 1-7.9 5 5 0 0 1 9.6 1.9A3.5 3.5 0 0 1 16 17H6z" />
      ),
    },
  ];

  const scrollToIndex = (index, behavior = "smooth") => {
    const track = trackRef.current;
    if (!track) return;
    const nextIndex = Math.max(0, Math.min(index, stats.length - 1));
    const isRtl = document.documentElement.dir === "rtl";
    const targetScrollLeft = isRtl ? -nextIndex * track.clientWidth : nextIndex * track.clientWidth;
    track.scrollTo({
      left: targetScrollLeft,
      behavior,
    });
    setActiveIndex(nextIndex);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    window.cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = window.requestAnimationFrame(() => {
      const nextIndex = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
      const clamped = Math.max(0, Math.min(nextIndex, stats.length - 1));
      setActiveIndex((prev) => (prev !== clamped ? clamped : prev));
    });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    return () => {
      window.cancelAnimationFrame(scrollRafRef.current);
    };
  }, [stats.length]);

  return (
    <section
      className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern flex flex-col p-0 max-desktop:min-h-[164px] motion-safe:animate-rise"
      style={{ animationDelay: "0.15s" }}
    >
      {/* Scrollable viewport */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        aria-label="Weather statistics carousel"
        className={clsx(
          "flex-1 min-h-0 flex overflow-x-auto scroll-smooth no-scrollbar touch-pan-x rounded-[18px]",
          "snap-x snap-mandatory",
          "max-desktop:flex-none max-desktop:min-h-[120px]"
        )}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex-none w-full min-w-full snap-start snap-always box-border flex flex-col"
          >
            {/* Stat tile */}
            <div className="p-[22px_24px_48px] flex flex-col justify-between flex-1 min-h-[100px]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted capitalize">{stat.label}</span>
                <StatIcon>{stat.icon}</StatIcon>
              </div>
              <div className="font-mono text-[22px] font-semibold mt-2.5">
                {stat.value}
                <small className="text-[13px] text-muted font-normal ml-0.5">{stat.unit}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot navigation footer */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center pointer-events-none min-h-5">
        <div
          role="group"
          aria-label="Weather statistics positions"
          className="flex items-center gap-2 pointer-events-auto"
        >
          {stats.map((stat, index) => (
            <button
              key={stat.label}
              type="button"
              aria-label={`Show ${stat.label}`}
              aria-pressed={activeIndex === index}
              onClick={() => scrollToIndex(index)}
              className={clsx(
                "w-2 h-2 p-0 border-0 rounded-full cursor-pointer transition-all duration-[160ms] ease-out",
                "hover:scale-[1.12] hover:opacity-100",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-sky/70 focus-visible:outline-offset-[3px]",
                activeIndex === index
                  ? "bg-accent-sky opacity-100"
                  : "bg-muted opacity-60"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
