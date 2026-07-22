import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { getDewPoint } from "../../helpers/getDewPoint";
import { getWindDirectionAbbr } from "../../helpers/getWindDirection";
import { useUnit } from "../../contexts/UnitContext";

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

  const { current, hourly } = weatherData;
  const { pressure, humidity, wind_speed, wind_deg, visibility, temp, clouds } =
    current;

  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLocale =
    rawLang === "fr" ? "fr-FR" : rawLang === "ar" ? "ar-EG" : "en-US";
  const numFormatter = new Intl.NumberFormat(activeLocale, {
    numberingSystem: "latn",
  });
  const noGroupFormatter = new Intl.NumberFormat(activeLocale, {
    numberingSystem: "latn",
    useGrouping: false,
  });

  const {
    unitSystem,
    convertTemp,
    convertWind,
    convertVisibility,
    convertPressure,
  } = useUnit();

  const dewPointC = getDewPoint(temp, humidity);
  const dewPointDisplay = Number.isFinite(dewPointC) ? convertTemp(dewPointC) : "--";

  const windObj = convertWind(wind_speed);
  const windDir = getWindDirectionAbbr(wind_deg, t);

  const visObj = convertVisibility(visibility);
  const presObj = convertPressure(pressure);

  // ── 1. PRESSURE TREND ──
  const hourlyData = hourly || [];
  const currentPressure = Number.isFinite(pressure) ? pressure : 1013;
  // Forecast entries carry their own pressure readings. Do not replace missing
  // readings with the current value before plotting, otherwise the sparkline
  // becomes a flat line even when the forecast contains real pressure changes.
  const pressureHistory = hourlyData
    .slice(0, 24)
    .map((h) => h.pressure)
    .filter(Number.isFinite)
    .reverse();
  const pressureSamples =
    pressureHistory.length >= 2
      ? pressureHistory
      : [
          currentPressure - 3,
          currentPressure - 1,
          currentPressure + 1,
          currentPressure,
          currentPressure + 2,
        ];
  // Convert samples for trend calculation if imperial (hPa -> inHg)
  const convertedSamples = pressureSamples.map((p) => {
    if (unitSystem === "imperial") {
      return Number((p * 0.02953).toFixed(2));
    }
    return p;
  });

  const diff24h = convertedSamples[convertedSamples.length - 1] - convertedSamples[0];
  const absDiff = Math.abs(diff24h);
  const formattedDiff = unitSystem === "imperial" ? absDiff.toFixed(2) : Math.round(absDiff);

  let trendSymbol = "→";
  let trendLabelKey = "stable";
  if (diff24h > (unitSystem === "imperial" ? 0.02 : 0.5)) {
    trendSymbol = "↗";
    trendLabelKey = "rising";
  } else if (diff24h < (unitSystem === "imperial" ? -0.02 : -0.5)) {
    trendSymbol = "↘";
    trendLabelKey = "falling";
  }
  const trendText = `${trendSymbol} ${t(`stats.${trendLabelKey}`)}`;
  const pressureDescKey = unitSystem === "imperial" ? "stats.pressureTrendDescImperial" : "stats.pressureTrendDesc";
  const pressureDesc = t(pressureDescKey, {
    change: `${diff24h >= 0 ? "+" : "-"}${formattedDiff}`,
  });

  // ── 2. HUMIDITY INSIGHT ──
  let humidityInsight = t("stats.humidityComfortable");
  if (humidity > 65) {
    humidityInsight = t("stats.humiditySticky");
  } else if (humidity < 35) {
    humidityInsight = t("stats.humidityDry");
  }

  // ── 3. WIND INSIGHT ──
  const windKmhValue = Math.round(wind_speed * 3.6);
  let windInsight = t("stats.windCalm");
  if (windKmhValue > 28) {
    windInsight = t("stats.windStrong");
  } else if (windKmhValue > 10) {
    windInsight = t("stats.windModerate");
  } else if (windKmhValue > 1) {
    windInsight = t("stats.windLight");
  }

  // ── 4. VISIBILITY INSIGHT ──
  const visKmValue = Number((visibility / 1000).toFixed(1));
  let visibilityInsight = t("stats.visibilityExcellent");
  if (visKmValue < 3) {
    visibilityInsight = t("stats.visibilityPoor");
  } else if (visKmValue < 8) {
    visibilityInsight = t("stats.visibilityModerate");
  }

  // ── 5. DEW POINT INSIGHT ──
  const dpValue = Number.isFinite(dewPointC) ? dewPointC : 12;
  let dewPointInsight = t("stats.dewPointComfortable");
  let comfortCategoryKey = "comfortComfortable";
  if (dpValue > 20) {
    dewPointInsight = t("stats.dewPointMuggy");
    comfortCategoryKey = "comfortMuggy";
  } else if (dpValue < 10) {
    dewPointInsight = t("stats.dewPointDry");
    comfortCategoryKey = "comfortDry";
  }

  // ── 6. CLOUD COVER INSIGHT ──
  let cloudInsight = t("stats.cloudsPartly");
  if (clouds > 80) {
    cloudInsight = t("stats.cloudsOvercast");
  } else if (clouds < 20) {
    cloudInsight = t("stats.cloudsSunny");
  }

  const stats = [
    {
      label: t("stats.pressure"),
      value: presObj.value,
      unit: t(presObj.unitKey),
      type: "pressure",
      insight: pressureDesc,
      icon: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5" />
          <path d="M11 12h2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M16 16l-1.5-1.5" />
          <path d="M8 16l1.5-1.5" />
        </>
      ),
    },
    {
      label: t("stats.humidity"),
      value: Number.isFinite(humidity) ? humidity : "--",
      unit: "%",
      type: "humidity",
      insight: humidityInsight,
      icon: <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" />,
    },
    {
      label: t("stats.wind"),
      value: windObj.value,
      unit: `${t(windObj.unitKey)} ${windDir}`,
      type: "wind",
      insight: windInsight,
      icon: (
        <>
          <path d="M3 8h11a3 3 0 1 0-3-3" />
          <path d="M3 16h14a3 3 0 1 1-3 3" />
        </>
      ),
    },
    {
      label: t("stats.visibility"),
      value: visObj.value,
      unit: t(visObj.unitKey),
      type: "visibility",
      insight: visibilityInsight,
      icon: (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ),
    },
    {
      label: t("stats.dewPoint"),
      value: dewPointDisplay,
      unit: unitSystem === "imperial" ? "°F" : "°C",
      type: "dewPoint",
      insight: dewPointInsight,
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
      type: "clouds",
      insight: cloudInsight,
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
    const targetScrollLeft = isRtl
      ? -nextIndex * track.clientWidth
      : nextIndex * track.clientWidth;
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
      const nextIndex = Math.round(
        Math.abs(track.scrollLeft) / track.clientWidth,
      );
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
          "max-desktop:flex-none max-desktop:min-h-[120px]",
        )}
      >
        {stats.map((stat) => {
          // Shared structure properties
          const headerBlock = (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-muted capitalize">
                {stat.label}
              </span>
              <StatIcon>{stat.icon}</StatIcon>
            </div>
          );

          const valueBlock = (
            <div className="font-mono text-[22px] leading-[1.25] font-semibold mt-1 overflow-visible">
              {stat.value}
              <small className="text-[13px] text-muted font-normal ml-0.5">
                {stat.unit}
              </small>
            </div>
          );

          const footerBlock = (
            <span className="text-[10px] text-muted leading-tight mt-auto pt-1 line-clamp-2">
              {stat.insight}
            </span>
          );

          return (
            <div
              key={stat.label}
              className="flex-none w-full min-w-full snap-start snap-always box-border flex flex-col"
            >
              <div className="p-[22px_24px_48px] flex flex-row justify-between items-stretch flex-1 min-h-[100px] gap-4">
                {/* Left details pane */}
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex flex-col">
                    {headerBlock}
                    {valueBlock}
                  </div>

                  {/* Additional info block */}
                  {stat.type === "pressure" && (
                    <span className="text-[12px] font-semibold text-accent-sky flex items-center gap-1 mt-1.5">
                      {trendText}
                    </span>
                  )}
                  {stat.type === "dewPoint" && (
                    <span className="text-[11px] font-semibold text-accent-sky capitalize mt-1.5">
                      {t(`stats.${comfortCategoryKey}`)}
                    </span>
                  )}
                  {stat.type === "wind" && windKmhValue > 0 && (
                    <span className="text-[11px] font-semibold text-accent-sky mt-1.5">
                      {windDir}
                    </span>
                  )}
                  {footerBlock}
                </div>

                {/* Right visualization widget pane (55% width) */}
                <div className="w-[55%] flex flex-col justify-center items-center select-none relative">
                  {/* PRESSURE VISUALIZATION */}
                  {stat.type === "pressure" &&
                    (() => {
                      const minP = Math.min(...convertedSamples);
                      const maxP = Math.max(...convertedSamples);
                      const pRange = maxP - minP || 0.05;
                      const w = 150;
                      const h = 55;
                      const pts = convertedSamples.map((val, idx) => {
                        const x =
                          (idx / (convertedSamples.length - 1)) * (w - 8) + 4;
                        const y = h - 6 - ((val - minP) / pRange) * (h - 12);
                        return { x, y };
                      });
                      const lPath = pts
                        .map((p, idx) =>
                          idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`,
                        )
                        .join(" ");
                      const aPath = pts.length
                        ? `${lPath} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`
                        : "";
                      const lastPt = pts[pts.length - 1];

                      return (
                        <div className="w-full flex flex-col justify-center gap-2 pt-2">
                          <svg
                            width="100%"
                            height={h}
                            viewBox={`0 0 ${w} ${h}`}
                            preserveAspectRatio="none"
                            className="overflow-visible"
                          >
                            <defs>
                              <linearGradient
                                id="p-grad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#38bdf8"
                                  stopOpacity="0.18"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#38bdf8"
                                  stopOpacity="0.0"
                                />
                              </linearGradient>
                            </defs>
                            <path d={aPath} fill="url(#p-grad)" />
                            <path
                              d={lPath}
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {lastPt && (
                              <>
                                <circle
                                  cx={lastPt.x}
                                  cy={lastPt.y}
                                  r="5"
                                  fill="#38bdf8"
                                  className="animate-pulse opacity-40"
                                />
                                <circle
                                  cx={lastPt.x}
                                  cy={lastPt.y}
                                  r="2.5"
                                  fill="#38bdf8"
                                />
                              </>
                            )}
                          </svg>
                          <div className="flex justify-between text-[8px] text-muted px-1 mt-1 font-mono">
                            <span>24h ago</span>
                            <span>12h ago</span>
                            <span className="text-accent-sky font-semibold">
                              Now
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                  {/* HUMIDITY VISUALIZATION (Water gauge wave) */}
                  {stat.type === "humidity" &&
                    (() => {
                      const fillValue = Number.isFinite(humidity)
                        ? humidity
                        : 50;
                      const r = 24;
                      const circ = 2 * Math.PI * r;
                      const offset = circ - (fillValue / 100) * circ;
                      return (
                        <div className="relative flex items-center justify-center w-[72px] h-[72px]">
                          <svg className="w-full h-full transform -rotate-90">
                            {/* Rail ring */}
                            <circle
                              cx="36"
                              cy="36"
                              r={r}
                              fill="none"
                              stroke="rgba(255,255,255,0.06)"
                              strokeWidth="4.5"
                            />
                            {/* Water active ring */}
                            <circle
                              cx="36"
                              cy="36"
                              r={r}
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="4.5"
                              strokeDasharray={circ}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          {/* Middle value & water droplet */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                            <span className="text-[14px] font-mono font-bold text-accent-sky">
                              {fillValue}%
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3 h-3 text-accent-sky/80 mt-0.5 animate-bounce"
                            >
                              <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" />
                            </svg>
                          </div>
                        </div>
                      );
                    })()}

                  {/* WIND VISUALIZATION (Compass Widget) */}
                  {stat.type === "wind" &&
                    (() => {
                      const rotation = Number.isFinite(wind_deg) ? wind_deg : 0;
                      return (
                        <div className="relative flex items-center justify-center w-[76px] h-[76px] border border-white/[0.07] rounded-full bg-white/[0.01]">
                          <span className="absolute top-1 text-[8px] font-bold text-muted/60">
                            N
                          </span>
                          <span className="absolute bottom-1 text-[8px] font-bold text-muted/60">
                            S
                          </span>
                          <span className="absolute left-1 text-[8px] font-bold text-muted/60">
                            W
                          </span>
                          <span className="absolute right-1 text-[8px] font-bold text-muted/60">
                            E
                          </span>

                          {/* Rotating directional arrow container */}
                          <div
                            className="w-8 h-8 flex items-center justify-center transition-transform duration-500 ease-out"
                            style={{ transform: `rotate(${rotation}deg)` }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="w-6 h-6 text-accent-sky"
                            >
                              <line x1="12" y1="19" x2="12" y2="5" />
                              <polyline points="5 12 12 5 19 12" />
                            </svg>
                          </div>
                          {/* Dynamic speed particle dot floating round the circle */}
                          {windKmhValue > 0 && (
                            <div
                              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-accent-sky rounded-full"
                              style={{
                                transform: `translate(-50%, -50%) rotate(${rotation - 90}deg) translate(30px)`,
                                boxShadow: "0 0 6px #38bdf8",
                              }}
                            />
                          )}
                        </div>
                      );
                    })()}

                  {/* VISIBILITY VISUALIZATION (Horizon Gradient Scale) */}
                  {stat.type === "visibility" &&
                    (() => {
                      const maxVal = unitSystem === "imperial" ? 6 : 10;
                      const numVal = Number(visObj.value);
                      const value = Math.min(maxVal, Math.max(0, Number.isFinite(numVal) ? numVal : 0));
                      const percentage = (value / maxVal) * 100;
                      return (
                        <div className="w-[85%] flex flex-col justify-center items-stretch h-full gap-3 pt-3">
                          {/* Background scale representing a foggy horizon */}
                          <div className="h-4 w-full rounded-full relative overflow-hidden bg-gradient-to-r from-white/10 via-[#38bdf8]/30 to-[#38bdf8] border border-white/5">
                            {/* Indicator pin representing current sight range */}
                            <div
                              className="absolute top-0 bottom-0 w-1.5 bg-white border border-[#0A1826] rounded-full transition-all duration-700 shadow-lg"
                              style={{ left: `calc(${percentage}% - 3px)` }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] text-muted font-mono leading-none">
                            <span>0 {unitSystem === "imperial" ? "mi" : "km"} (Fog)</span>
                            <span>{maxVal}+ {unitSystem === "imperial" ? "mi" : "km"} (Clear)</span>
                          </div>
                        </div>
                      );
                    })()}

                  {/* DEW POINT VISUALIZATION (Comfort Thermometer bar) */}
                  {stat.type === "dewPoint" &&
                    (() => {
                      const minDp = 0;
                      const maxDp = 24;
                      const percent = Math.min(
                        100,
                        Math.max(
                          0,
                          ((dpValue - minDp) / (maxDp - minDp)) * 100,
                        ),
                      );
                      return (
                        <div className="w-[85%] flex flex-col justify-center items-stretch h-full gap-3 pt-3">
                          <div className="h-4 w-full rounded-full relative bg-gradient-to-r from-[#38bdf8] via-emerald-400 to-amber-500 border border-white/5 overflow-hidden">
                            {/* Comfort sliding pointer */}
                            <div
                              className="absolute top-0 bottom-0 w-1.5 bg-white border border-[#0A1826] rounded-full transition-all duration-700 shadow-md"
                              style={{ left: `calc(${percent}% - 3px)` }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] text-muted font-mono leading-none px-0.5">
                            <span>{t("stats.comfortDry")}</span>
                            <span className="text-emerald-400">
                              {t("stats.comfortComfortable")}
                            </span>
                            <span className="text-amber-500">
                              {t("stats.comfortMuggy")}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                  {/* CLOUD COVER VISUALIZATION (Animated skies) */}
                  {stat.type === "clouds" &&
                    (() => {
                      const pct = Number.isFinite(clouds) ? clouds : 0;
                      return (
                        <div className="w-[85%] flex flex-col justify-center items-stretch h-full gap-3 pt-3">
                          <div className="h-4 w-full rounded-full relative overflow-hidden bg-white/[0.03] border border-white/5">
                            {/* Cloud overlay background representing cloud density */}
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accent-sky/20 to-[#eef3f7]/30 transition-all duration-700 ease-out"
                              style={{ width: `${pct}%` }}
                            />
                            {/* Current marker */}
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-accent-sky transition-all duration-700"
                              style={{ left: `calc(${pct}% - 2px)` }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] text-muted font-mono leading-none px-0.5">
                            <span>0% (Clear)</span>
                            <span>100% (Overcast)</span>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            </div>
          );
        })}
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
                  : "bg-muted opacity-60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
