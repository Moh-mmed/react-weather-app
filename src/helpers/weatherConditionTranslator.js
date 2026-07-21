/**
 * Helper to translate weather condition text (main or description) using i18n keys.
 * Handles OpenWeather API condition strings safely.
 */
export const translateConditionDescription = (weatherItem, t) => {
  if (!weatherItem) return "";
  const { description, main } = weatherItem;

  if (description) {
    const key = `weatherConditions.${description.toLowerCase()}`;
    if (t && t(key) !== key) {
      return t(key);
    }
  }

  if (main) {
    const key = `weatherConditions.${main}`;
    if (t && t(key) !== key) {
      return t(key);
    }
  }

  return description || main || "";
};

export const translateConditionMain = (weatherItem, t) => {
  if (!weatherItem) return "";
  const { main, description } = weatherItem;

  if (main) {
    const key = `weatherConditions.${main}`;
    if (t && t(key) !== key) {
      return t(key);
    }
  }

  if (description) {
    const key = `weatherConditions.${description.toLowerCase()}`;
    if (t && t(key) !== key) {
      return t(key);
    }
  }

  return main || description || "";
};
