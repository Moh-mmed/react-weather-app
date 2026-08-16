import { useTranslation } from "react-i18next";
import { getUsAqiFromComponents } from "../../helpers/getUsAqi";
import clsx from "clsx";

const AqiIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4 text-accent-sky opacity-90"
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const getRelativeUpdateLabel = (unixSeconds, t) => {
  if (!Number.isFinite(unixSeconds)) return t ? t("aqi.updatedUnknown", { defaultValue: "Updated recently" }) : "Updated recently";
  const diffMin = Math.max(0, Math.round(Date.now() / 1000 - unixSeconds) / 60);
  if (diffMin < 1) return t ? t("aqi.updatedJustNow", { defaultValue: "Updated just now" }) : "Updated just now";
  if (diffMin < 60) {
    const mins = Math.round(diffMin);
    return t
      ? t("aqi.updatedMinutesAgo", { count: mins, defaultValue: `Updated ${mins} minute${mins === 1 ? "" : "s"} ago` })
      : `Updated ${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  const hours = Math.round(diffMin / 60);
  return t
    ? t("aqi.updatedHoursAgo", { count: hours, defaultValue: `Updated ${hours} hour${hours === 1 ? "" : "s"} ago` })
    : `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
};

const AirQualityExpanded = ({ airQuality }) => {
  const { t } = useTranslation();

  if (!airQuality || !airQuality.list || !airQuality.list[0]) {
    return (
      <section className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-6 flex flex-col justify-center items-center h-full min-h-[300px]">
        <span className="text-muted text-sm">{t("aqi.unavailable", { defaultValue: "AQI data unavailable" })}</span>
      </section>
    );
  }

  const { components } = airQuality.list[0];
  const {
    aqi,
    label,
    markerPercent,
    category,
  } = getUsAqiFromComponents(components, t);

  // Define scale colors for categories
  const categories = [
    { key: "good", color: "bg-[#5FB88A]", label: t("aqi.shortCategories.good") || "Good" },
    { key: "moderate", color: "bg-[#f4d93b]", label: t("aqi.shortCategories.moderate") || "Moderate" },
    { key: "usg", color: "bg-[#F4A93B]", label: t("aqi.shortCategories.usg") || "USG" },
    { key: "unhealthy", color: "bg-[#E2694A]", label: t("aqi.shortCategories.unhealthy") || "Unhealthy" },
    { key: "hazardous", color: "bg-[#a85fd9]", label: t("aqi.shortCategories.hazardous") || "Hazardous" },
  ];

  // Map pollutant values and safe limits
  const pollutants = [
    { name: "PM2.5", value: components.pm2_5, max: 75, unit: "µg/m³" },
    { name: "PM10", value: components.pm10, max: 150, unit: "µg/m³" },
    { name: "O₃", value: components.o3, max: 120, unit: "µg/m³" },
    { name: "NO₂", value: components.no2, max: 100, unit: "µg/m³" },
    { name: "SO₂", value: components.so2, max: 80, unit: "µg/m³" },
    { name: "CO", value: components.co, max: 5000, unit: "µg/m³" },
  ];

  // Color mapping based on health status
  const getPollutantColor = (name, val) => {
    if (name === "PM2.5") {
      if (val <= 12) return "bg-[#5FB88A]";
      if (val <= 35.4) return "bg-[#f4d93b]";
      if (val <= 55.4) return "bg-[#F4A93B]";
      return "bg-[#E2694A]";
    }
    if (name === "PM10") {
      if (val <= 54) return "bg-[#5FB88A]";
      if (val <= 154) return "bg-[#f4d93b]";
      if (val <= 254) return "bg-[#F4A93B]";
      return "bg-[#E2694A]";
    }
    if (name === "O₃") {
      if (val <= 54) return "bg-[#5FB88A]";
      if (val <= 70) return "bg-[#f4d93b]";
      if (val <= 85) return "bg-[#F4A93B]";
      return "bg-[#E2694A]";
    }
    if (name === "NO₂") {
      if (val <= 53) return "bg-[#5FB88A]";
      if (val <= 100) return "bg-[#f4d93b]";
      if (val <= 360) return "bg-[#F4A93B]";
      return "bg-[#E2694A]";
    }
    if (name === "SO₂") {
      if (val <= 35) return "bg-[#5FB88A]";
      if (val <= 75) return "bg-[#f4d93b]";
      if (val <= 185) return "bg-[#F4A93B]";
      return "bg-[#E2694A]";
    }
    if (name === "CO") {
      if (val <= 4400) return "bg-[#5FB88A]";
      if (val <= 9400) return "bg-[#f4d93b]";
      if (val <= 12400) return "bg-[#F4A93B]";
      return "bg-[#E2694A]";
    }
    return "bg-accent-sky";
  };

  // Custom recommendations based on AQI value
  const getRecommendation = (aqiScore) => {
    if (aqiScore === null || !Number.isFinite(aqiScore)) {
      return t("aqi.recommendations.unavailable", {
        defaultValue: "Air quality data is currently unavailable.",
      });
    }
    if (aqiScore <= 50) {
      return t("aqi.recommendations.good", {
        defaultValue: "An excellent day for outdoor activities and fresh air ventilation.",
      });
    } else if (aqiScore <= 100) {
      return t("aqi.recommendations.moderate", {
        defaultValue: "Sensitive groups should consider reducing prolonged outdoor exertion.",
      });
    } else if (aqiScore <= 150) {
      return t("aqi.recommendations.unhealthySensitive", {
        defaultValue: "Sensitive groups should avoid prolonged outdoor activity. Everyone else limit exertion.",
      });
    } else if (aqiScore <= 200) {
      return t("aqi.recommendations.unhealthy", {
        defaultValue: "Active children, adults, and people with respiratory disease should avoid outdoor activity.",
      });
    } else {
      return t("aqi.recommendations.veryUnhealthy", {
        defaultValue: "Everyone should avoid all outdoor exertion. Keep windows closed and run air filters.",
      });
    }
  };

  const getRecommendationColor = (aqiScore) => {
    if (aqiScore === null || !Number.isFinite(aqiScore)) return "text-muted";
    if (aqiScore <= 50) return "text-emerald-400";
    if (aqiScore <= 100) return "text-amber-300";
    if (aqiScore <= 150) return "text-orange-400";
    return "text-rose-400";
  };

  return (
    <section
      className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-6 flex flex-col justify-between h-full motion-safe:animate-rise"
      style={{ animationDelay: "0.05s" }}
    >
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold flex items-center gap-2">
          <AqiIcon />
          {t("aqi.title") || "AIR QUALITY"}
        </div>
      </div>

      {/* Main AQI Value Block */}
      <div className="mt-3 flex items-center gap-4">
        <div className="font-display font-semibold text-[48px] leading-none text-primary">
          {aqi === null ? "--" : aqi}
        </div>
        <div className="flex flex-col">
          <div className="text-[15px] font-bold text-primary leading-tight">
            {label}
          </div>
          <div className="text-[11px] text-muted font-mono uppercase tracking-wider">
            {t("aqi.usScaleLabel", { defaultValue: "US AQI SCALE" })}
          </div>
        </div>
      </div>

      {/* Color Scale Bar */}
      <div className="mt-4 relative">
        <div
          className="h-2.5 rounded-full w-full"
          style={{
            background:
              "linear-gradient(90deg, #5FB88A 0%, #f4d93b 25%, #F4A93B 50%, #E2694A 75%, #a85fd9 100%)",
          }}
        />
        {/* Custom Glowing Slider Marker */}
        <div
          className="absolute -top-[3px] w-4 h-4 rounded-full border-[3px] border-white -translate-x-1/2 shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-500"
          style={{
            left: `${markerPercent}%`,
            backgroundColor: aqi === null ? "var(--bg-main-2)" : aqi <= 50 ? "#5FB88A" : aqi <= 100 ? "#f4d93b" : aqi <= 150 ? "#F4A93B" : aqi <= 200 ? "#E2694A" : "#a85fd9",
          }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-2.5 px-0.5">
        {categories.map((c) => (
          <span
            key={c.key}
            className={clsx(
              "text-[10px] font-semibold tracking-wide transition-colors",
              aqi > 0 && category.toLowerCase().includes(c.key)
                ? "text-primary font-bold scale-[1.05]"
                : "text-muted opacity-60"
            )}
          >
            {c.label}
          </span>
        ))}
      </div>

      <div className="h-px bg-white/[0.06] my-4" />

      {/* Pollutants Grid */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
        {pollutants.map((p) => {
          const hasPollutantValue = Number.isFinite(p.value);
          const percent = hasPollutantValue
            ? Math.min((p.value / p.max) * 100, 100)
            : 0;
          const barColor = hasPollutantValue
            ? getPollutantColor(p.name, p.value)
            : "bg-white/20";
          return (
            <div key={p.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline text-[11px] font-mono">
                <span className="text-muted font-bold font-sans">{p.name}</span>
                <span className="text-primary font-semibold">
                  {hasPollutantValue ? Math.round(p.value) : "--"}
                  <span className="text-[9px] text-muted font-normal ml-0.5 font-sans">
                    {p.unit}
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 border border-white/[0.04] overflow-hidden">
                <div
                  className={clsx("h-full rounded-full transition-all duration-700 ease-out", barColor)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-white/[0.06] my-4" />

      {/* Health Recommendation */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-sans">
          {t("aqi.recommendationTitle", { defaultValue: "Health Recommendation" })}
        </span>
        <p className={clsx("text-[12px] leading-relaxed", getRecommendationColor(aqi))}>
          {getRecommendation(aqi)}
        </p>
      </div>

      <div className="h-px bg-white/[0.06] my-4" />

      {/* Footer */}
      <div className="flex items-center text-[10px] text-muted font-mono leading-none">
        <span>{getRelativeUpdateLabel(airQuality?.list?.[0]?.dt, t)}</span>
      </div>
    </section>
  );
};

export default AirQualityExpanded;
