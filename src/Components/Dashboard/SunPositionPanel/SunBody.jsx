/**
 * SunBody — renders the sun at the given arc position with a radial glow,
 * bloom filter, and smooth color transitions.
 *
 * Props:
 *   cx, cy    — position on the arc
 *   color     — current fill color (hex)
 *   visible   — boolean (false hides the sun for night phase)
 */
const SunBody = ({ cx, cy, color, visible }) => {
  const opacity = visible ? 1 : 0;

  return (
    <g
      style={{
        opacity,
        transition: 'opacity 3s ease',
      }}
    >
      {/* Outer bloom / halo — largest, most diffuse */}
      <circle
        cx={cx}
        cy={cy}
        r="26"
        fill={`${color}28`}
        style={{ transition: 'fill 2.5s ease, cx 0.8s ease, cy 0.8s ease' }}
      />

      {/* Mid glow ring */}
      <circle
        cx={cx}
        cy={cy}
        r="16"
        fill={`${color}50`}
        style={{
          filter: 'blur(2px)',
          transition: 'fill 2.5s ease',
        }}
      />

      {/* Radial gradient disk using the svg defs gradient */}
      <circle
        cx={cx}
        cy={cy}
        r="14"
        fill="url(#sunGlow)"
        style={{ transition: 'cx 0.8s ease, cy 0.8s ease' }}
      />

      {/* Solid core with bloom filter */}
      <circle
        cx={cx}
        cy={cy}
        r="7"
        fill={color}
        filter="url(#sunBloom)"
        className="motion-safe:animate-pulseSun"
        style={{
          transition: 'fill 2.5s ease',
        }}
      />
    </g>
  );
};

export default SunBody;
