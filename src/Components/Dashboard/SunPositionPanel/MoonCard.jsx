import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MoonDisplay, { usePrefersReducedMotion } from "../MoonDisplay";
import { getDayLabel } from "../../../helpers/weatherTime";

// ─── Illumination count-up hook (300–500ms) ────────────────────────────────
const useCountUp = (target, reduced) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduced || !Number.isFinite(target)) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    const duration = 450;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return value;
};

// ─── Line-art icons ─────────────────────────────────────────────────────────
const MoonriseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
    <path d="M4 20h16" />
    <path d="M12 16V8.5" />
    <path d="m8.5 12 3.5-3.5 3.5 3.5" />
    <path d="M17 6a5.5 5.5 0 0 0-10.5.9" />
  </svg>
);

const MoonsetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
    <path d="M4 20h16" />
    <path d="M12 8.5V16" />
    <path d="m8.5 12.5 3.5 3.5 3.5-3.5" />
    <path d="M17 6a5.5 5.5 0 0 0-10.5.9" />
  </svg>
);

// Calendar line-art icon — matches the moonrise/moonset stroke style
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <circle cx="8"  cy="15" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="15" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Day label helper ────────────────────────────────────────────────────────
// Classifies a "YYYY-MM-DD" date string as "Today", "Tomorrow", "Yesterday",
// or a short weekday name. The comparison uses the WEATHER LOCATION calendar
// (getDayLabel + getLocationDateKey), never `new Date()`/browser time, so the
// label is identical regardless of the browser timezone. The date strings come
// from Visual Crossing already in the location's local calendar.

// ─── Moon phase key (mirrors astronomyService.getMoonPhaseName) ───────────────
const getMoonPhaseKey = (phase) => {
  if (!Number.isFinite(phase)) return null;
  if (phase < 0.03 || phase > 0.97) return "newMoon";
  if (phase < 0.22) return "waxingCrescent";
  if (phase < 0.28) return "firstQuarter";
  if (phase < 0.47) return "waxingGibbous";
  if (phase < 0.53) return "fullMoon";
  if (phase < 0.72) return "waningGibbous";
  if (phase < 0.78) return "lastQuarter";
  return "waningCrescent";
};

// ─── Single info cell (icon + label + value + optional day sub-label) ────────
const InfoCell = ({ icon, label, value, dayLabel }) => (
  <div className="flex flex-col items-center text-center gap-1 min-w-0">
    <span className="text-muted/80">{icon}</span>
    <span className="text-[9px] uppercase tracking-[0.8px] text-muted leading-none">
      {label}
    </span>
    <span className="font-mono text-[12.5px] font-medium text-primary leading-none">
      {value}
    </span>
    {dayLabel && (
      <span className="text-[9px] text-muted/60 leading-none mt-0.5">
        {dayLabel}
      </span>
    )}
  </div>
);

// ─── Bottom card: moon phase, illumination, moonrise / moonset / next full moon
const MoonCard = ({
  moonPhase,
  moonPhaseName,
  illumination,
  moonrise,
  moonset,
  nextFullMoon,
  moonRaw,
  hemisphere = "northern",
  timezoneOffset,
}) => {
  const { t, i18n } = useTranslation();
  const reduced = usePrefersReducedMotion();

  const phaseKey = getMoonPhaseKey(moonPhase);
  const phaseName = phaseKey
    ? t(`moonPhases.${phaseKey}`, { defaultValue: moonPhaseName })
    : moonPhaseName || "--";
  const hasIllumination = Number.isFinite(illumination);
  const illuminated = useCountUp(hasIllumination ? illumination : null, reduced);

  // Day labels use the weather location's calendar (getDayLabel resolves the
  // "today" boundary via the location's timezone offset). Null moonrise/moonset
  // stay null and render "--".
  const nowUnix = Math.floor(Date.now() / 1000);
  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLocale =
    rawLang === "fr" ? "fr-FR" : rawLang === "ar" ? "ar-EG" : "en-US";

  const translateDay = (label) => {
    if (label === "Today") return t("sun.today", { defaultValue: "Today" });
    if (label === "Tomorrow") return t("sun.tomorrow", { defaultValue: "Tomorrow" });
    if (label === "Yesterday") return t("sun.yesterday", { defaultValue: "Yesterday" });
    return label;
  };

  const moonriseDay = translateDay(
    getDayLabel(moonRaw?.moonriseDate ?? null, nowUnix, timezoneOffset, activeLocale)
  );
  const moonsetDay = translateDay(
    getDayLabel(moonRaw?.moonsetDate ?? null, nowUnix, timezoneOffset, activeLocale)
  );

  // Normalise the nextFullMoon value: the service returns "0 days" when the
  // full moon is tonight, but we display "Tonight" in that case. Otherwise the
  // "N days" string is pluralized in the active language.
  const fullMoonValue = (() => {
    if (!nextFullMoon) return "--";
    if (nextFullMoon === "0 days" || nextFullMoon === "Tonight")
      return t("sun.tonight", { defaultValue: "Tonight" });
    const days = Number(String(nextFullMoon).replace(/\D/g, ""));
    if (Number.isFinite(days)) {
      return t("sun.nextFullMoonDays", {
        count: days,
        defaultValue: `${days} days`,
      });
    }
    return nextFullMoon;
  })();

  return (
    <div
      className="w-full rounded-chip p-[14px_14px_18px] box-border"
      style={{
        background: "rgba(30,60,110,0.22)",
        border: "1px solid rgba(100,150,220,0.25)",
      }}
    >
      {/* Two-column layout: moon (left ~35%) + info (right ~65%) */}
      <div className="flex items-center gap-4">
        <div className="w-[35%] shrink-0 flex items-center justify-center">
          <MoonDisplay phase={moonPhase ?? 0} size={88} hemisphere={hemisphere} />
        </div>

        <div className="w-[65%] min-w-0 flex flex-col">
          <div className="text-[10px] uppercase tracking-[1.2px] text-muted font-semibold">
            {t("sun.moon")}
          </div>
          <div className="font-display text-[17px] font-semibold text-primary capitalize leading-tight">
            {phaseName}
          </div>
          <div className="text-[12px] text-muted mt-0.5">
            {hasIllumination ? illuminated : "--"}
            {t("sun.illuminatedSuffix", { defaultValue: "% Illuminated" })}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 my-2.5" />

          {/* Moonrise / Moonset / Next Full Moon — three equal columns */}
          <div className="grid grid-cols-3 gap-1">
            <InfoCell
              icon={<MoonriseIcon />}
              label={t("sun.moonrise")}
              value={moonrise || "--"}
              dayLabel={moonrise ? moonriseDay : null}
            />
            <InfoCell
              icon={<MoonsetIcon />}
              label={t("sun.moonset")}
              value={moonset || "--"}
              dayLabel={moonset ? moonsetDay : null}
            />
            <InfoCell
              icon={<CalendarIcon />}
              label={t("sun.nextFullMoon", { defaultValue: "Next Full Moon" })}
              value={fullMoonValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonCard;
