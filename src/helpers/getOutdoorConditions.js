/**
 * Helper to compute outdoor conditions score, level, title, description, and highlights.
 *
 * Input:
 *   data: { uvi, visibilityMeters, windSpeedMs, humidity, aqiUs }
 *   t: optional i18n translation function (key, { defaultValue }) => string
 *
 * Output:
 *   {
 *     score: number, // 0-100
 *     level: "good" | "good-overall" | "fair" | "poor",
 *     title: string,
 *     description: string,
 *     highlights: Array<{ type: "good" | "warn", label: string }>
 *   }
 */

const capitalize = (str) =>
  typeof str === "string" && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : "";

export const getOutdoorConditions = (data = {}, t) => {
  const tr = (key, fallback, extra = {}) => {
    if (typeof t === "function") {
      return t(key, { ...extra, defaultValue: fallback });
    }
    return fallback;
  };

  const safeData = data || {};
  const { uvi, visibilityMeters, windSpeedMs, humidity, aqiUs } = safeData;

  const factorEvaluations = [];

  // 1. UV Index
  if (Number.isFinite(uvi) && uvi >= 0) {
    if (uvi < 3) {
      factorEvaluations.push({
        key: "uv",
        score: 100,
        type: "good",
        posClause: tr("outdoorConditions.clauses.lowUv", "low UV"),
        label: tr("outdoorConditions.highlights.lowUv", "Low UV"),
      });
    } else if (uvi < 6) {
      factorEvaluations.push({
        key: "uv",
        score: 80,
        type: "good",
        posClause: tr("outdoorConditions.clauses.moderateUv", "moderate UV"),
        label: tr("outdoorConditions.highlights.moderateUv", "Moderate UV"),
      });
    } else if (uvi < 8) {
      factorEvaluations.push({
        key: "uv",
        score: 55,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.elevatedUv", "elevated UV"),
        label: tr("outdoorConditions.highlights.highUv", "High UV"),
      });
    } else if (uvi < 11) {
      factorEvaluations.push({
        key: "uv",
        score: 30,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.veryHighUv", "very high UV"),
        label: tr("outdoorConditions.highlights.veryHighUv", "Very high UV"),
      });
    } else {
      factorEvaluations.push({
        key: "uv",
        score: 10,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.extremeUv", "extreme UV"),
        label: tr("outdoorConditions.highlights.extremeUv", "Extreme UV"),
      });
    }
  }

  // 2. Visibility (visibilityMeters in meters, converted to km)
  if (Number.isFinite(visibilityMeters) && visibilityMeters >= 0) {
    const visKm = visibilityMeters / 1000;
    if (visKm >= 10) {
      factorEvaluations.push({
        key: "visibility",
        score: 100,
        type: "good",
        posClause: tr("outdoorConditions.clauses.clearVisibility", "clear visibility"),
        label: tr("outdoorConditions.highlights.goodVisibility", "Good visibility"),
      });
    } else if (visKm >= 8) {
      factorEvaluations.push({
        key: "visibility",
        score: 75,
        type: "neutral",
        label: tr("outdoorConditions.highlights.goodVisibility", "Good visibility"),
      });
    } else if (visKm >= 2) {
      factorEvaluations.push({
        key: "visibility",
        score: 45,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.reducedVisibility", "reduced visibility"),
        label: tr("outdoorConditions.highlights.reducedVisibility", "Reduced visibility"),
      });
    } else {
      factorEvaluations.push({
        key: "visibility",
        score: 15,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.poorVisibility", "poor visibility"),
        label: tr("outdoorConditions.highlights.poorVisibility", "Poor visibility"),
      });
    }
  }

  // 3. Wind (windSpeedMs in m/s)
  if (Number.isFinite(windSpeedMs) && windSpeedMs >= 0) {
    if (windSpeedMs < 1) {
      factorEvaluations.push({
        key: "wind",
        score: 100,
        type: "good",
        posClause: tr("outdoorConditions.clauses.calmAir", "calm air"),
        label: tr("outdoorConditions.highlights.calmAir", "Calm air"),
      });
    } else if (windSpeedMs < 5) {
      factorEvaluations.push({
        key: "wind",
        score: 85,
        type: "good",
        posClause: tr("outdoorConditions.clauses.lightWind", "light wind"),
        label: tr("outdoorConditions.highlights.lightWind", "Light breeze"),
      });
    } else if (windSpeedMs < 11) {
      factorEvaluations.push({
        key: "wind",
        score: 55,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.moderateBreeze", "moderate wind"),
        label: tr("outdoorConditions.highlights.moderateBreeze", "Moderate breeze"),
      });
    } else {
      factorEvaluations.push({
        key: "wind",
        score: 25,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.strongWind", "strong wind"),
        label: tr("outdoorConditions.highlights.strongWind", "Strong wind"),
      });
    }
  }

  // 4. Humidity
  if (Number.isFinite(humidity) && humidity >= 0 && humidity <= 100) {
    if (humidity < 35) {
      factorEvaluations.push({
        key: "humidity",
        score: 55,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.veryDryAir", "the air is very dry"),
        label: tr("outdoorConditions.highlights.veryDryAir", "Very dry air"),
      });
    } else if (humidity <= 65) {
      factorEvaluations.push({
        key: "humidity",
        score: 100,
        type: "good",
        posClause: tr("outdoorConditions.clauses.comfortableHumidity", "comfortable humidity"),
        label: tr("outdoorConditions.highlights.comfortableHumidity", "Comfortable humidity"),
      });
    } else if (humidity <= 85) {
      factorEvaluations.push({
        key: "humidity",
        score: 55,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.humidAir", "humid air"),
        label: tr("outdoorConditions.highlights.humidAir", "Humid air"),
      });
    } else {
      factorEvaluations.push({
        key: "humidity",
        score: 35,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.veryHumidAir", "very humid air"),
        label: tr("outdoorConditions.highlights.veryHumidAir", "High humidity"),
      });
    }
  }

  // 5. AQI (US EPA scale)
  if (Number.isFinite(aqiUs) && aqiUs >= 0) {
    if (aqiUs <= 50) {
      factorEvaluations.push({
        key: "aqi",
        score: 100,
        type: "good",
        posClause: tr("outdoorConditions.clauses.goodAirQuality", "good air quality"),
        label: tr("outdoorConditions.highlights.goodAirQuality", "Good air quality"),
      });
    } else if (aqiUs <= 100) {
      factorEvaluations.push({
        key: "aqi",
        score: 75,
        type: "neutral",
        label: tr("outdoorConditions.highlights.moderateAqi", "Moderate AQI"),
      });
    } else if (aqiUs <= 150) {
      factorEvaluations.push({
        key: "aqi",
        score: 50,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.elevatedPollution", "elevated air pollution"),
        label: tr("outdoorConditions.highlights.elevatedPollution", "Elevated pollution"),
      });
    } else if (aqiUs <= 200) {
      factorEvaluations.push({
        key: "aqi",
        score: 25,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.poorAirQuality", "poor air quality"),
        label: tr("outdoorConditions.highlights.poorAirQuality", "Poor air quality"),
      });
    } else if (aqiUs <= 300) {
      factorEvaluations.push({
        key: "aqi",
        score: 10,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.veryPoorAirQuality", "very poor air quality"),
        label: tr("outdoorConditions.highlights.veryPoorAirQuality", "Very poor AQI"),
      });
    } else {
      factorEvaluations.push({
        key: "aqi",
        score: 0,
        type: "warn",
        cautionClause: tr("outdoorConditions.clauses.hazardousAirQuality", "hazardous air quality"),
        label: tr("outdoorConditions.highlights.hazardousAirQuality", "Hazardous air"),
      });
    }
  }

  // Handle missing or empty inputs safely
  if (factorEvaluations.length === 0) {
    return {
      score: 70,
      level: "fair",
      title: tr("outdoorConditions.titles.fair", "Fair conditions"),
      description: tr("outdoorConditions.descriptions.noData", "Outdoor conditions data is limited."),
      highlights: [],
    };
  }

  // Calculate score: average sub-scores, round to nearest integer
  const totalScore = factorEvaluations.reduce((sum, item) => sum + item.score, 0);
  const score = Math.round(totalScore / factorEvaluations.length);

  // Level & Title
  let level = "fair";
  let titleKey = "outdoorConditions.titles.fair";
  let titleFallback = "Fair conditions";

  if (score >= 85) {
    level = "good";
    titleKey = "outdoorConditions.titles.good";
    titleFallback = "Good conditions";
  } else if (score >= 70) {
    level = "good-overall";
    titleKey = "outdoorConditions.titles.goodOverall";
    titleFallback = "Good overall";
  } else if (score >= 50) {
    level = "fair";
    titleKey = "outdoorConditions.titles.fair";
    titleFallback = "Fair conditions";
  } else {
    level = "poor";
    titleKey = "outdoorConditions.titles.poor";
    titleFallback = "Poor conditions";
  }

  const title = tr(titleKey, titleFallback);

  // Description building
  const positives = factorEvaluations
    .filter((f) => f.score >= 80 && f.posClause)
    .sort((a, b) => b.score - a.score);

  const factorPriority = { humidity: 1, uvi: 2, aqi: 3, wind: 4, visibility: 5 };

  const cautions = factorEvaluations
    .filter((f) => f.score <= 55 && f.cautionClause)
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return (factorPriority[a.key] || 99) - (factorPriority[b.key] || 99);
    }); // lowest score first (most severe), then factor priority

  let description = "";

  const and = tr("outdoorConditions.connectors.and", " and ");
  const but = tr("outdoorConditions.connectors.but", ", but ");

  if (cautions.length === 0) {
    if (positives.length === 0) {
      description = tr("outdoorConditions.descriptions.normal", "Outdoor conditions are pleasant.");
    } else if (positives.length === 1) {
      description = `${capitalize(positives[0].posClause)}.`;
    } else {
      const p1 = positives[0].posClause;
      const p2 = positives[1].posClause;
      description = `${capitalize(p1)}${and}${p2}.`;
    }
  } else if (positives.length > 0) {
    // Both positives and cautions exist
    const posPart =
      positives.length >= 2
        ? `${capitalize(positives[0].posClause)}${and}${positives[1].posClause}`
        : `${capitalize(positives[0].posClause)}`;
    description = `${posPart}${but}${cautions[0].cautionClause}.`;
  } else {
    // Cautions only
    const c1 = capitalize(cautions[0].cautionClause);
    if (cautions.length === 1) {
      description = tr(
        "outdoorConditions.descriptions.lessComfortableSingle",
        `${c1} makes outdoor activity less comfortable.`,
        { clause: c1 }
      );
    } else {
      const c2 = cautions[1].cautionClause;
      description = tr(
        "outdoorConditions.descriptions.lessComfortablePlural",
        `${c1} and ${c2} make outdoor activity less comfortable.`,
        { clause1: c1, clause2: c2 }
      );
    }
  }

  // Highlights building (max 3)
  const warnHighlights = cautions.map((c) => ({
    type: "warn",
    label: c.label,
  }));

  const goodHighlights = positives.map((p) => ({
    type: "good",
    label: p.label,
  }));

  const highlights = [...warnHighlights, ...goodHighlights].slice(0, 3);

  return {
    score,
    level,
    title,
    description,
    highlights,
  };
};
