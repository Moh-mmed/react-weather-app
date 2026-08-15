import { getShadowOffset } from "../MoonDisplay";

const SHADOW_COLOR = "rgba(10, 15, 30, 0.88)";
const R = 9;

const MoonBody = ({
  cx,
  cy,
  visible,
  phase = 0.5,
  hemisphere = "northern",
}) => {
  const opacity = visible ? 1 : 0;
  const fraction = Number.isFinite(phase) ? (((phase % 1) + 1) % 1) : 0;
  const offset = Math.max(-2, Math.min(2, getShadowOffset(fraction, hemisphere)));

  return (
    <g
      style={{
        opacity,
        transition: 'opacity 3s ease',
      }}
    >
      {/* Outer soft glow */}
      <circle cx={cx} cy={cy} r="26" fill="url(#moonGlow)" />

      {/* Radial shadow beneath moon */}
      <circle cx={cx + 1} cy={cy + 1} r="10" fill="rgba(0,0,0,0.25)" filter="blur(3px)" />

      {/* Moon disc — soft blue-white */}
      <circle cx={cx} cy={cy} r={R} fill="#d2e8f8" filter="url(#moonBloom)" opacity="0.92" />

      {/* Phase shadow: a full shadow disc the same size as the moon, slid
          sideways and clipped back to the moon's silhouette. The overlap
          boundary is always a smooth curve — never a straight split. */}
      <g transform={`translate(${cx}, ${cy})`} clipPath="url(#moonDiscClip)">
        <circle
          cx={offset * R}
          cy="0"
          r={R}
          fill={SHADOW_COLOR}
          filter="blur(0.5px)"
        />
      </g>
    </g>
  );
};

export default MoonBody;
