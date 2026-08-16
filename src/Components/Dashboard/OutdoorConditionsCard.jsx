import { useTranslation } from "react-i18next";
import { getUsAqiFromComponents } from "../../helpers/getUsAqi";
import { getOutdoorConditions } from "../../helpers/getOutdoorConditions";
import { CARD_BASE } from "./metricCardShared";

const OutdoorConditionsCard = ({ page, animationDelay = "0.1s" }) => {
  const { t } = useTranslation();

  const current = page?.weatherData?.current || {};
  const components = page?.airQuality?.list?.[0]?.components || {};

  const { aqi } = getUsAqiFromComponents(components, t);

  const result = getOutdoorConditions(
    {
      uvi: current.uvi,
      visibilityMeters: current.visibility,
      windSpeedMs: current.wind_speed,
      humidity: current.humidity,
      aqiUs: aqi,
    },
    t
  );

  // Status badge styling and label
  const isFair = result.level === "fair";

  let statusBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
  let statusDot = "bg-emerald-500";
  let statusLabel = t("outdoorConditions.statusGoodPrecaution", {
    defaultValue: "Good, with precautions",
  });

  if (result.level === "good") {
    statusBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    statusDot = "bg-emerald-500";
    statusLabel = t("outdoorConditions.statusGood", {
      defaultValue: "Good conditions",
    });
  } else if (result.level === "good-overall") {
    statusBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    statusDot = "bg-emerald-500";
    statusLabel = t("outdoorConditions.statusGoodPrecaution", {
      defaultValue: "Good, with precautions",
    });
  } else if (result.level === "fair") {
    statusBg = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    statusDot = "bg-amber-500";
    statusLabel = t("outdoorConditions.statusFair", {
      defaultValue: "Fair conditions",
    });
  } else {
    statusBg = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
    statusDot = "bg-rose-500";
    statusLabel = t("outdoorConditions.statusPoor", {
      defaultValue: "Poor conditions",
    });
  }

  // Dynamic Headline
  let headline = t("outdoorConditions.headlines.good", {
    defaultValue: "Good time to go outside",
  });
  if (result.level === "poor") {
    headline = t("outdoorConditions.headlines.poor", {
      defaultValue: "Less favorable for outdoors",
    });
  } else if (isFair && (current.uvi >= 8 || current.humidity < 30)) {
    headline = t("outdoorConditions.headlines.fairPrecaution", {
      defaultValue: "Pleasant outside, take precautions",
    });
  }

  // Dynamic Advice Items based on real data
  const isHighUv = Number.isFinite(current.uvi) && current.uvi >= 6;
  const isExtremeUv = Number.isFinite(current.uvi) && current.uvi >= 8;
  const isDry = Number.isFinite(current.humidity) && current.humidity < 35;
  const isWindy = Number.isFinite(current.wind_speed) && current.wind_speed >= 8;

  const adviceItems = [
    {
      id: "uv",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      ),
      iconBg: isExtremeUv
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      title: isHighUv
        ? t("outdoorConditions.advice.protectSkinTitle", { defaultValue: "Protect Your Skin" })
        : t("outdoorConditions.advice.lowUvTitle", { defaultValue: "Mild UV Exposure" }),
      desc: isHighUv
        ? t("outdoorConditions.advice.highUvDesc", {
            defaultValue: `UV index is high (${Math.round(current.uvi || 0)}) — wear sunscreen and sunglasses.`,
          })
        : t("outdoorConditions.advice.lowUvDesc", {
            defaultValue: "Low UV levels — comfortable for extended daylight outdoor activity.",
          }),
      tag: isExtremeUv ? "High UV" : isHighUv ? "Moderate UV" : "Low Risk",
      tagColor: isExtremeUv
        ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    },
    {
      id: "humidity",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      ),
      iconBg: isDry
        ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
        : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
      title: isDry
        ? t("outdoorConditions.advice.hydrateTitle", { defaultValue: "Stay Hydrated" })
        : t("outdoorConditions.advice.comfortableHumidityTitle", { defaultValue: "Comfortable Air" }),
      desc: isDry
        ? t("outdoorConditions.advice.dryAirDesc", {
            defaultValue: `Very dry air (${Math.round(current.humidity || 0)}% RH) — drink water regularly during walks.`,
          })
        : t("outdoorConditions.advice.comfortableHumidityDesc", {
            defaultValue: `Balanced moisture (${Math.round(current.humidity || 0)}% RH) makes breathing effortless.`,
          }),
      tag: isDry ? "Dry Air" : "Balanced",
      tagColor: isDry
        ? "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
        : "bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300",
    },
    {
      id: "wind",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2" />
        </svg>
      ),
      iconBg: isWindy
        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
        : "bg-teal-500/15 text-teal-600 dark:text-teal-400",
      title: isWindy
        ? t("outdoorConditions.advice.breezyWindTitle", { defaultValue: "Breezy Conditions" })
        : t("outdoorConditions.advice.comfortableBreezeTitle", { defaultValue: "Comfortable Breeze" }),
      desc: isWindy
        ? t("outdoorConditions.advice.strongWindDesc", {
            defaultValue: "Moderate breeze creates noticeable wind resistance in open spots.",
          })
        : t("outdoorConditions.advice.lightWindDesc", {
            defaultValue: "Light airflow keeps conditions feeling fresh and pleasant.",
          }),
      tag: isWindy ? "Breezy" : "Gentle",
      tagColor: isWindy
        ? "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"
        : "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300",
    },
  ];

  return (
    <div
      className={`${CARD_BASE} metric-card--outdoor p-5 sm:p-6`}
      style={{ animationDelay, width: "100%" }}
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0284C7]/10 text-[#0284C7] dark:bg-[#38BDF8]/15 dark:text-[#38BDF8]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B] dark:text-[#94A3B8]">
            {t("outdoorConditions.eyebrow", { defaultValue: "OUTDOOR CONDITIONS" })}
          </span>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-tight shadow-sm ${statusBg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
          {statusLabel}
        </span>
      </div>

      {/* 2. Hero Atmosphere Banner */}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F0F7FF] via-[#E6F0FA] to-[#FEF3C7]/40 p-4 border border-[#E2E8F0]/70 dark:border-white/10 dark:from-[#1E293B]/70 dark:via-[#0F172A]/70 dark:to-[#332014]/30 shadow-inner">
        {/* Soft Background Art Elements */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl dark:bg-amber-500/10" />
        <div className="pointer-events-none absolute right-16 -bottom-6 h-24 w-24 rounded-full bg-sky-400/20 blur-2xl dark:bg-sky-500/10" />

        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌤️</span>
            <h3 className="font-serif text-[18px] sm:text-[19px] font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              {headline}
            </h3>
          </div>
          <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-[#475569] dark:text-[#94A3B8]">
            {result.description ||
              t("outdoorConditions.defaultDescription", {
                defaultValue:
                  "Excellent visibility and a comfortable breeze make it pleasant outdoors, but high UV and dry air call for simple precautions.",
              })}
          </p>
        </div>
      </div>

      {/* 3. Actionable Advice Stack (Clean Horizontal Rows) */}
      <div className="mt-3.5 flex flex-col gap-2.5">
        {adviceItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0]/80 bg-white/70 p-2.5 transition-all duration-200 hover:border-[#CBD5E1] hover:bg-white hover:shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.iconBg}`}>
                {item.icon}
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {item.title}
                </div>
                <div className="text-[11.5px] leading-snug text-[#64748B] dark:text-[#94A3B8] truncate sm:whitespace-normal">
                  {item.desc}
                </div>
              </div>
            </div>
            <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold ${item.tagColor}`}>
              {item.tag}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Hairline Divider + 5. Best For Activities — pinned to the card bottom */}
      <div className="mt-auto">
        <div className="my-3.5 h-px w-full bg-[#E2E8F0] dark:bg-white/10" />

        {/* 5. Best For Activities Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8] dark:text-[#64748B]">
              {t("outdoorConditions.bestForLabel", { defaultValue: "BEST FOR" })}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#1E293B] shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-[#F1F5F9]">
              <span>🚶</span>
              {t("outdoorConditions.activities.walking", { defaultValue: "Walking" })}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#1E293B] shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-[#F1F5F9]">
              <span>📸</span>
              {t("outdoorConditions.activities.photography", { defaultValue: "Photography" })}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#1E293B] shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-[#F1F5F9]">
              <span>☕</span>
              {t("outdoorConditions.activities.cafe", { defaultValue: "Outdoor Café" })}
            </span>

            {isHighUv && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                <span>⚠️</span>
                {t("outdoorConditions.cautions.sunExposure", { defaultValue: "Long sun exposure" })}
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-[#94A3B8] dark:text-[#64748B]">
            {t("outdoorConditions.timestamp", { defaultValue: "Real-time advice" })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OutdoorConditionsCard;
