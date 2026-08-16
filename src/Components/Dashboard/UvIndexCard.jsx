import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CARD_BASE,
  CardHeader,
  StatusPill,
  VALUE_CLASS,
} from "./metricCardShared";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const SCALE_MAX = 11;

// Computes marker horizontal position to match standard category divisions
export const getUvPercentage = (uvi) => {
  const val = clamp(uvi, 0, SCALE_MAX);
  if (val <= 3) {
    return (val / 3) * 25;
  }
  if (val <= 6) {
    return 25 + ((val - 3) / 3) * 25;
  }
  if (val <= 8) {
    return 50 + ((val - 6) / 2) * 20;
  }
  if (val <= 10) {
    return 70 + ((val - 8) / 2) * 20;
  }
  return 90 + ((val - 10) / 1) * 10;
};

export const getUvBand = (uvi) => {
  if (uvi >= 11) {
    return {
      labelKey: "weatherStatus.uv.labels.extreme",
      exposureKey: "metrics.extremeExposure",
      color: "#8B5CF6",
      colorClassName: "text-[#8B5CF6]",
      pillClassName:
        "bg-purple-50 text-[#7C3AED] dark:bg-purple-400/14 dark:text-purple-200",
    };
  }

  if (uvi >= 8) {
    return {
      labelKey: "weatherStatus.uv.labels.veryHigh",
      exposureKey: "metrics.veryHighExposure",
      color: "#E2694A",
      colorClassName: "text-[#E2694A]",
      pillClassName:
        "bg-red-50 text-[#D95D43] dark:bg-[#E2694A]/12 dark:text-[#FF9A82]",
    };
  }

  if (uvi >= 6) {
    return {
      labelKey: "weatherStatus.uv.labels.high",
      exposureKey: "metrics.highExposure",
      color: "#E28A2E",
      colorClassName: "text-[#E28A2E]",
      pillClassName:
        "bg-orange-50 text-[#C96F1C] dark:bg-orange-400/14 dark:text-orange-200",
    };
  }

  if (uvi >= 3) {
    return {
      labelKey: "weatherStatus.uv.labels.moderate",
      exposureKey: "metrics.moderateExposure",
      color: "#F4D34F",
      colorClassName: "text-[#D9A928]",
      pillClassName:
        "bg-yellow-50 text-[#B98511] dark:bg-yellow-400/14 dark:text-yellow-200",
    };
  }

  return {
    labelKey: "weatherStatus.uv.labels.low",
    exposureKey: "metrics.lowExposure",
    color: "#5FB88A",
    colorClassName: "text-emerald-500 dark:text-emerald-400",
    pillClassName:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300",
  };
};

const UvIndexCard = ({
  uvi,
  sunrise,
  sunset,
  currentTime,
  dt,
  animationDelay,
}) => {
  const { t } = useTranslation();

  const displayTime = Number.isFinite(currentTime) ? currentTime : dt;
  const isNight =
    Number.isFinite(displayTime) &&
    Number.isFinite(sunrise) &&
    Number.isFinite(sunset)
      ? displayTime < sunrise || displayTime >= sunset
      : false;

  // A genuine 0 (UV = 0) is a valid reading; only non-finite input is missing.
  const hasUvi = Number.isFinite(uvi);

  // At nighttime, primary current UV is 0 / Low Exposure.
  // The API daily peak `uvi` is preserved and rendered as secondary context.
  const effectiveUvi = isNight ? 0 : uvi;
  const hasEffectiveUvi = isNight ? true : hasUvi;

  const displayValue = hasEffectiveUvi ? Math.round(effectiveUvi) : "--";
  const band = hasEffectiveUvi
    ? getUvBand(effectiveUvi)
    : {
        labelKey: "weatherStatus.na",
        exposureKey: null,
        color: "#8795A5",
        colorClassName: "text-[#8795A5] dark:text-[#A9B8C7]",
        pillClassName:
          "bg-[#E7EDF4] text-[#8795A5] dark:bg-white/10 dark:text-[#A9B8C7]",
      };
  const uvPercentage = hasEffectiveUvi ? getUvPercentage(effectiveUvi) : 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className={`${CARD_BASE} metric-card--uv`} style={{ animationDelay }}>
      <CardHeader
        label={t("stats.uvIndex")}
        iconBg="bg-[#FFF8EC]"
        iconColor="text-[#F4A93B]"
        iconBgDark="dark:bg-[#F4A93B]/14"
        icon={
          <svg
            viewBox="0 0 24 24"
            className="h-[17px] w-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4.4" />
            <path d="M12 2.4v2.1M12 19.5v2.1M2.4 12h2.1M19.5 12h2.1M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5" />
          </svg>
        }
      />

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className={VALUE_CLASS}>{displayValue}</span>
          </div>
          <div
            className={`mt-1.5 text-[clamp(0.82rem,1vw,0.95rem)] font-bold ${band.colorClassName}`}
          >
            {t(band.labelKey)}
          </div>
          {isNight && hasUvi && (
            <div className="mt-1 text-[clamp(0.72rem,0.9vw,0.82rem)] font-semibold text-[#8795A5] dark:text-[#A9B8C7]">
              {t("stats.uvPeakToday", { value: Math.round(uvi) })}
            </div>
          )}
        </div>

        {/* Continuous UV scale */}
        <div className="mt-3 flex min-h-0 flex-1 flex-col justify-center">
          <div className="px-1.5">
            <div className="relative h-[6px] w-full rounded-full bg-[#E8F4FB] dark:bg-white/[0.07]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#5FB88A] via-[#F4D34F] via-[#E28A2E] via-[#E2694A] to-[#8B5CF6]"
                style={{
                  width: `${uvPercentage}%`,
                  opacity: mounted ? 1 : 0,
                  transition:
                    "width 600ms cubic-bezier(0.16,1,0.3,1), opacity 600ms ease",
                }}
              />
              {hasEffectiveUvi && (
                <div
                  className="absolute top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#8B5CF6] bg-white shadow-[0_2px_8px_rgba(15,35,56,0.18)] dark:bg-[#13273D]"
                  style={{
                    left: mounted ? `${uvPercentage}%` : "0%",
                    borderColor: band.color,
                    transition:
                      "left 600ms cubic-bezier(0.16,1,0.3,1), border-color 200ms ease",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <StatusPill
        status={band.exposureKey ? t(band.exposureKey) : null}
        className={band.pillClassName}
      />
    </div>
  );
};

export default UvIndexCard;
