/**
 * HorizonGlow — a wide, low ellipse that simulates warm horizon light.
 * Fades in/out based on the current sky phase.
 */
const HorizonGlow = ({ phase }) => {
  const isVisible = phase === 'sunset' || phase === 'blue-hour' || phase === 'dawn' || phase === 'night';
  const color =
    phase === 'sunset'     ? 'rgba(230, 100, 40, 0.38)' :
    phase === 'blue-hour'  ? 'rgba(80,  110, 200, 0.22)' :
    phase === 'night'      ? 'rgba(60,  100, 180, 0.12)' :
    phase === 'dawn'       ? 'rgba(200, 140,  80, 0.28)' :
    'rgba(0,0,0,0)';

  return (
    <ellipse
      cx="175"
      cy="170"
      rx="145"
      ry="18"
      fill={color}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 3s ease, fill 3s ease',
        filter: 'blur(6px)',
      }}
    />
  );
};

export default HorizonGlow;
