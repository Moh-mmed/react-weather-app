/**
 * SkyGradient — SVG gradient/filter definitions used by the sun and moon bodies.
 */
const SkyGradient = () => (
  <defs>
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

    {/* Clip the moon's sliding phase shadow back to the moon-disc silhouette.
        Origin-centered so it works for every moon regardless of position. */}
    <clipPath id="moonDiscClip">
      <circle cx="0" cy="0" r="9" />
    </clipPath>

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
