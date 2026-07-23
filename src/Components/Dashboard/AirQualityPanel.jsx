import { useTranslation } from "react-i18next";
import { getUsAqiFromComponents } from "../../helpers/getUsAqi";

const AqiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-85">
    <path d="M3 12h4l2-6 4 12 2-6h6" />
  </svg>
);

const AirQualityPanel = ({ airQuality }) => {
  const { t } = useTranslation();
  const { components } = airQuality.list[0];
  const { aqi, label, mainPollutant, markerPercent } =
    getUsAqiFromComponents(components, t);

  const scaleKeys = [
    "good",
    "moderate",
    "usg",
    "unhealthy",
    "hazardous",
  ];

  return (
    <section
      className="relative overflow-hidden rounded-panel border border-panel-line bg-navy-panel bg-panel-pattern p-[22px_24px] motion-safe:animate-rise"
      style={{ animationDelay: "0.05s" }}
    >
      {/* Panel title */}
      <div className="text-[12px] uppercase tracking-[1.2px] text-muted font-semibold mb-1 flex items-center gap-2">
        <AqiIcon />
        {t("aqi.title")}
      </div>

      {/* AQI number + label badge */}
      <div className="flex items-baseline gap-2.5 mt-1.5">
        <div className="font-display font-semibold text-[40px] leading-none">{aqi}</div>
        <div className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-accent-sun/[0.18] text-accent-sun">
          {label}
        </div>
      </div>

      {/* Main pollutant */}
      <div className="text-[12px] text-muted mt-0.5">
        {t("aqi.mainPollutant", { pollutant: mainPollutant })}
      </div>

      {/* Gradient gauge bar */}
      <div
        className="mt-4 relative h-2 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, #5FB88A, #f4d93b, #F4A93B, #E2694A, #a85fd9)",
        }}
      >
        {/* Marker */}
        <div
          className="absolute -top-1 w-4 h-4 rounded-full border-[3px] border-[#f4d93b] -translate-x-1/2 shadow-[0_0_0_3px_rgba(0,0,0,0.25)]"
          style={{
            left: `${markerPercent}%`,
            backgroundColor: "var(--bg-main-2)",
          }}
        />
      </div>

      {/* Gauge scale labels */}
      <div className="flex justify-between mt-2">
        {scaleKeys.map((k) => (
          <span key={k} className="text-[10px] text-muted">
            {t(`aqi.shortCategories.${k}`)}
          </span>
        ))}
      </div>
    </section>
  );
};

export default AirQualityPanel;
