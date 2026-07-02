const ARC = {
  cx: 175,
  cy: 170,
  radius: 150,
  startX: 25,
  startY: 170,
  endX: 325,
  endY: 170,
};

export const getSunArcPoint = (progress) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const angle = Math.PI * (1 - clamped);
  const x = ARC.cx + ARC.radius * Math.cos(angle);
  const y = ARC.cy - ARC.radius * Math.sin(angle);

  return { x, y };
};

export const getSunArcPath = (progress) => {
  const { x, y } = getSunArcPoint(progress);
  const largeArc = progress > 0.5 ? 1 : 0;

  return `M ${ARC.startX} ${ARC.startY} A ${ARC.radius} ${ARC.radius} 0 ${largeArc} 1 ${x} ${y}`;
};

export const SUN_ARC_BASE = `M ${ARC.startX} ${ARC.startY} A ${ARC.radius} ${ARC.radius} 0 0 1 ${ARC.endX} ${ARC.endY}`;
