import { useTranslation } from "react-i18next";
import {
  CARD_BASE,
  CardHeader,
  StatusPill,
  UNIT_CLASS,
  VALUE_CLASS,
} from "./metricCardShared";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const VIS_MAX_KM = 16.093;

const getVisibilityBand = (visKm) => {
  if (visKm < 2) {
    return {
      statusKey: "weatherStatus.visibility.labels.poor",
      labelClassName: "text-[#4FA3D9] dark:text-[#7CC0EC]",
      pillClassName:
        "bg-[#EAF6FE] text-[#2E7FB5] dark:bg-[#4FA3D9]/12 dark:text-[#8CCCF2]",
    };
  }

  if (visKm < 8) {
    return {
      statusKey: "weatherStatus.visibility.labels.moderate",
      labelClassName: "text-[#4FA3D9] dark:text-[#7CC0EC]",
      pillClassName:
        "bg-[#EAF6FE] text-[#2E7FB5] dark:bg-[#4FA3D9]/12 dark:text-[#8CCCF2]",
    };
  }

  return {
    statusKey: "weatherStatus.visibility.labels.excellent",
    labelClassName: "text-emerald-500 dark:text-emerald-400",
    pillClassName:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300",
  };
};

const MISSING_BAND = {
  statusKey: null,
  labelClassName: "text-[#8795A5] dark:text-[#A9B8C7]",
  pillClassName:
    "bg-[#E7EDF4] text-[#8795A5] dark:bg-white/10 dark:text-[#A9B8C7]",
};

const VisibilityCard = ({ value, unit, visKm, animationDelay }) => {
  const { t } = useTranslation();
  // A genuine 0 m is a valid observation; only non-finite input is missing.
  const hasVisibility = Number.isFinite(visKm);
  const band = hasVisibility ? getVisibilityBand(visKm) : MISSING_BAND;
  const percent = hasVisibility ? clamp(visKm / VIS_MAX_KM, 0, 1) * 100 : 0;
  const statusLabel = band.statusKey ? t(band.statusKey) : t("weatherStatus.na");

  return (
    <div
      className={`${CARD_BASE} metric-card--visibility`}
      style={{ animationDelay }}
    >
      <CardHeader
        label={t("stats.visibility")}
        iconBg="bg-[#EAF6FE]"
        iconColor="text-[#4FA3D9]"
        iconBgDark="dark:bg-[#4FA3D9]/12"
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
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      />

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mt-[clamp(0.8rem,1.8vh,1.25rem)]">
          <div className="flex items-baseline gap-1.5">
            <span className={VALUE_CLASS}>{value}</span>
            <span className={UNIT_CLASS}>{unit}</span>
          </div>
          <div
            className={`mt-2 text-[clamp(0.82rem,1vw,0.95rem)] font-bold ${band.labelClassName}`}
          >
            {statusLabel}
          </div>
        </div>

        {/* Visibility scale */}
        <div className="mt-[clamp(0.7rem,1.6vh,1.1rem)] flex min-h-0 flex-1 flex-col justify-center">
          <div className="px-1.5">
            <div
              className="relative h-[6px] w-full rounded-full bg-[#E8F4FB] dark:bg-white/[0.07]"
              role="img"
              aria-label={t("stats.visibilityAria", {
                value,
                unit,
                status: statusLabel,
              })}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#A9D3EC] via-[#4FA3D9] to-[#1E5F8F]"
                style={{
                  width: `${percent}%`,
                  transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
              {hasVisibility && (
                <span
                  className="absolute top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#1E5F8F] bg-white shadow-[0_2px_8px_rgba(15,35,56,0.18)] dark:bg-[#13273D]"
                  style={{
                    left: `${percent}%`,
                    transition: "left 600ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <StatusPill
        status={band.statusKey ? t(band.statusKey) : null}
        className={band.pillClassName}
      />
    </div>
  );
};

export default VisibilityCard;
