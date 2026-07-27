/**
 * SkyGradient — fills the semicircular dome area with a smooth gradient.
 * Renders a clipPath-constrained rect so the gradient stays inside the arc.
 */
const SkyGradient = ({ top, mid, bottom }) => (
  <defs>
    {/* Clip the sky fill to the dome semicircle */}
    <clipPath id="domeClip">
      <path d="M 25 170 A 150 150 0 0 1 325 170 Z" />
    </clipPath>

    {/* Vertical sky gradient: top → mid → bottom */}
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   style={{ stopColor: top,    stopOpacity: 1, transition: 'stop-color 2.5s ease' }} />
      <stop offset="52%"  style={{ stopColor: mid,    stopOpacity: 1, transition: 'stop-color 2.5s ease' }} />
      <stop offset="100%" style={{ stopColor: bottom, stopOpacity: 1, transition: 'stop-color 2.5s ease' }} />
    </linearGradient>

    {/* Atmospheric shimmer gradient (very subtle) */}
    <radialGradient id="atmosGrad" cx="50%" cy="30%" r="60%">
      <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
    </radialGradient>

    {/* Sun radial glow gradient */}
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stopColor="rgba(255,220,100,0.9)" />
      <stop offset="35%"  stopColor="rgba(255,190,50,0.5)" />
      <stop offset="70%"  stopColor="rgba(244,169,59,0.15)" />
      <stop offset="100%" stopColor="rgba(244,169,59,0)" />
    </radialGradient>

    {/* Moon soft glow with blue tint */}
    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stopColor="rgba(180,215,255,0.45)" />
      <stop offset="40%"  stopColor="rgba(160,200,245,0.18)" />
      <stop offset="100%" stopColor="rgba(140,185,235,0)" />
    </radialGradient>

    {/* Sun inner bloom */}
    <filter id="sunBloom" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* Moon bloom */}
    <filter id="moonBloom" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export default SkyGradient;
