const getUVI = (UVI) => {
  if (!Number.isFinite(UVI)) return "unknown";
  if (UVI <= 2) return "low";
  if (UVI <= 5) return "moderate";
  if (UVI <= 7) return "high";
  if (UVI <= 10) return "very high";
  return "extreme";
};

export const getUviDescription = (uvi, t) => {
  const level = getUVI(uvi);
  if (t) {
    return {
      level,
      title: t(`uvi.title.${level}`),
      description: t(`uvi.desc.${level}`),
    };
  }

  const descriptions = {
    low: "Low risk from UV rays.",
    moderate: "Moderate risk — use sunscreen if outside for long periods.",
    high: "High risk — protection needed during midday hours.",
    "very high": "Very high UV. Skin damage possible in under 20 minutes — seek shade midday.",
    extreme: "Extreme UV. Avoid sun exposure around midday.",
    unknown: "UV data unavailable.",
  };

  return {
    level,
    title: level === "unknown" ? "UV unavailable" : `${level.charAt(0).toUpperCase()}${level.slice(1)} UV`,
    description: descriptions[level],
  };
};

export default getUVI;