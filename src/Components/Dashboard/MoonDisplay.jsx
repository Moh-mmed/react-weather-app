import { useEffect, useState } from "react";

export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
};

// ─── Moon illustration — full-moon texture + a single sliding shadow disc ──
// A lunar terminator is the projection of a great circle on a sphere: it's
// only ever a straight line exactly at the quarters, and an ellipse the
// rest of the time. Rather than drawing that curve by hand, we get it for
// free by overlapping TWO CIRCLES of equal radius — the moon disc and a
// shadow disc — and sliding the shadow disc sideways. Their intersection
// boundary is always a smooth curve:
//   offset = 0            → discs fully overlap        → new moon
//   offset = ±1 radius    → discs overlap by half      → quarter
//   offset = ±2 radii     → discs no longer overlap    → full moon
const SHADOW_COLOR = "rgba(20, 20, 20, 0.93)";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Shadow disc's horizontal offset from the moon's center, in units of the
// moon's own radius (range -2..2). Negative = shifted left.
export const getShadowOffset = (fraction, hemisphere = "northern") => {
  const f = ((fraction % 1) + 1) % 1;
  const offset = f <= 0.5 ? -4 * f : 4 * (1 - f);
  return hemisphere === "southern" ? -offset : offset;
};

const MoonDisplay = ({
  phase,
  size = 88,
  className = "",
  hemisphere = "northern",
}) => {
  const reduced = usePrefersReducedMotion();

  const fraction = Number.isFinite(phase) ? ((phase % 1) + 1) % 1 : 0;
  const offset = clamp(getShadowOffset(fraction, hemisphere), -2, 2);

  // translateX(%) is relative to the shadow disc's own width, which equals
  // one full diameter — so 1 radius = 50%.
  const translateX = `${(offset * 50).toFixed(2)}%`;

  // Soft feather on the terminator so it reads as light falloff, not a
  // graphic cut. Scales with the disc so it holds up at any `size`.
  const featherPx = Math.max(2, size * 0.045);

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow:
          "0 0 22px rgba(255,236,170,0.22), 0 8px 18px rgba(0,0,0,0.15)",
      }}
      role="img"
      aria-label={`Moon phase ${Math.round(fraction * 100)}%`}
    >
      <img
        src="/assets/moon/full-moon.png"
        alt=""
        width={size}
        height={size}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: SHADOW_COLOR,
          transform: `translateX(${translateX})`,
          filter: `blur(${featherPx}px)`,
          transition: reduced ? "none" : "transform 400ms ease",
        }}
      />
    </div>
  );
};

export default MoonDisplay;
