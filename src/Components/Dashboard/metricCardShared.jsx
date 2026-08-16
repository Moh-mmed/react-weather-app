export const CARD_BASE =
  "metric-card relative flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#E7EDF4] bg-white " +
  "p-[clamp(1rem,1.5vw,1.5rem)] " +
  "transition-all duration-[250ms] ease-out hover:-translate-y-[3px] " +
  "dark:border-white/10 dark:bg-[#13273D] motion-safe:animate-rise";

export const VALUE_CLASS =
  "font-display text-[clamp(1.5rem,2.1vw,2.2rem)] font-bold leading-[0.9] text-[#0F2338] dark:text-[#F5F8FB]";

export const UNIT_CLASS =
  "text-[clamp(0.72rem,0.88vw,0.88rem)] font-medium leading-none text-[#8795A5] dark:text-[#A9B8C7]";

export const CardHeader = ({
  icon,
  label,
  iconBg = "bg-[#EAF6FE]",
  iconColor = "text-[#4FA3D9]",
  iconBgDark = "dark:bg-[#4FA3D9]/12",
}) => (
  <div className="flex items-center gap-2">
    <span
      className={`grid h-7 w-7 place-items-center rounded-full ${iconBg} ${iconColor} ${iconBgDark}`}
    >
      {icon}
    </span>
    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7B8998] dark:text-[#9DAFC0]">
      {label}
    </span>
  </div>
);

export const StatusPill = ({ status, className }) =>
  status ? (
    <div
      className={`mt-auto inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[clamp(0.7rem,0.85vw,0.78rem)] font-semibold ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {status}
    </div>
  ) : null;
