import { useMemo } from "react";

// Deterministic pseudo-random using a seed (avoids layout thrash on re-renders)
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Star positions are seeded by the current calendar day so they don't
// re-randomize on every re-render, but change each day for variety.
const getDaySeed = () => {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
};

/**
 * StarField — renders 10 tiny stars inside the dome area.
 * Stars fade in during night and twinkle slowly.
 *
 * Props:
 *   visible — boolean (true at night / blue-hour)
 */
const StarField = ({ visible }) => {
  const stars = useMemo(() => {
    const rand = seededRandom(getDaySeed());
    return Array.from({ length: 12 }, (_, i) => {
      // Keep stars in the upper 65% of the dome (not too close to horizon)
      // The dome spans x: 25–325 (300px wide), y: 20–170 (150px tall in SVG space)
      const angle = rand() * Math.PI; // 0 → π for upper semicircle
      const radiusFraction = 0.25 + rand() * 0.65; // 25–90% of dome radius
      const r = 150 * radiusFraction;
      const x = 175 + r * Math.cos(Math.PI - angle); // mirrored for natural spread
      const y = 170 - r * Math.sin(angle);
      const size = 0.8 + rand() * 1.4;
      const delay = rand() * 6;
      const duration = 3 + rand() * 4;
      const baseOpacity = 0.2 + rand() * 0.4;
      return { id: i, x, y, size, delay, duration, baseOpacity };
    });
  }, []); // stable across renders

  return (
    <g
      className="star-field"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 3s ease',
      }}
      aria-hidden="true"
    >
      {stars.map((star) => (
        <circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={star.size}
          fill="rgba(210, 235, 255, 0.9)"
          className="motion-safe:animate-starTwinkle"
          style={{
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.baseOpacity,
            transformOrigin: `${star.x}px ${star.y}px`,
          }}
        />
      ))}
    </g>
  );
};

export default StarField;
