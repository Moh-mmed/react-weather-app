const MoonBody = ({ cx, cy, visible }) => {
  const opacity = visible ? 1 : 0;

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
      <circle cx={cx} cy={cy} r="9" fill="#d2e8f8" filter="url(#moonBloom)" opacity="0.92" />

      {/* Crescent carve-out — offset shadow to simulate phase */}
      <circle cx={cx + 5} cy={cy - 1} r="7.5" fill="#08131F" opacity="0.9" />
    </g>
  );
};

export default MoonBody;
