import { useTranslation } from "react-i18next";
import { formatTime } from "../../../helpers/timeFormat";
import {
  getMoonPhase,
  getNextSunrise,
  getTimeUntilSunrise,
  formatDuration,
} from "../../../helpers/sunArcUtils";
import { useTimeFormat } from "../../../contexts/TimeFormatContext";

const NightInfoCard = ({ dt, sunrise, sunset, timezone_offset, visible, currentTime }) => {
  const { t } = useTranslation();
  const { hourFormat } = useTimeFormat();
  const opacity = visible ? 1 : 0;
  const pointerEvents = visible ? "auto" : "none";
  const now = currentTime ?? Math.floor(Date.now() / 1000);

  const moonPhase = getMoonPhase(dt || 0);
  const nextSunriseTs = getNextSunrise(sunrise || 0, now);
  const sunriseTime = formatTime(nextSunriseTs, timezone_offset, hourFormat);
  const secondsUntil = getTimeUntilSunrise(sunrise || 0, now);
  const sunriseIn = secondsUntil !== null ? formatDuration(secondsUntil) : "--";

  const phaseName = t(`moonPhases.${moonPhase.key}`, { defaultValue: moonPhase.key });

  return (
    <div
      className="absolute inset-0 w-full rounded-chip p-[14px_14px_18px] box-border"
      style={{
        opacity,
        pointerEvents,
        transition: 'opacity 2.5s ease',
        background: 'rgba(30,60,110,0.22)',
        border: '1px solid rgba(100,150,220,0.25)',
      }}
      aria-hidden={!visible}
    >
      {/* Moon phase — primary */}
      <div className="flex items-center gap-3 mb-3">
        <div className="font-display font-semibold text-[28px] leading-none select-none" aria-hidden="true">
          {moonPhase.emoji}
        </div>
        <div>
          <div className="text-muted uppercase tracking-[0.6px] text-[10px]">
            {t("night.moonPhase", { defaultValue: "Moon Phase" })}
          </div>
          <div className="text-primary font-semibold capitalize text-[14px]">{phaseName}</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-3" />

      {/* Next sunrise + countdown */}
      <div className="flex gap-6">
        <div>
          <div className="text-muted uppercase tracking-[0.6px] text-[10px]">
            {t("night.nextSunrise", { defaultValue: "Next Sunrise" })}
          </div>
          <div className="font-mono text-primary font-medium text-[14px]">{sunriseTime}</div>
        </div>
        <div>
          <div className="text-muted uppercase tracking-[0.6px] text-[10px]">
            {t("night.sunriseIn", { defaultValue: "Sunrise in" })}
          </div>
          <div className="font-mono text-primary font-medium text-[14px]">{sunriseIn}</div>
        </div>
      </div>
    </div>
  );
};

export default NightInfoCard;
