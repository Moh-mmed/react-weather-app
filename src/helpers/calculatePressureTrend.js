// Pressure-trend helper: derives direction/difference from a set of REAL
// chronological pressure samples. Operates on raw hPa values (the API is
// always fetched with units=metric). NEVER fabricates samples: when fewer
// than 2 valid samples exist the result explicitly reports "no trend"
// (direction: null, difference: null).
//
// Threshold: reuses the existing application semantics for a meaningful
// pressure change (1.5 hPa), previously applied to the metric display value.
// Because the trend now always runs on raw hPa, a single hPa threshold is
// used regardless of the display unit system.

export const PRESSURE_TREND_THRESHOLD_HPA = 1.5;

const isValidPressure = (value) => Number.isFinite(value);

// samples: array of { dt, pressure } (dt in Unix seconds, pressure in hPa).
// Returns { direction, difference, samples } where:
//   - direction: "rising" | "falling" | "stable" | null
//   - difference: newest.pressure - oldest.pressure (hPa) | null
//   - samples: valid samples sorted oldest → newest (chronological)
export const calculatePressureTrend = (samples) => {
  const valid = (samples || [])
    .filter((sample) => sample && isValidPressure(sample.pressure))
    .map((sample) => ({
      dt: sample.dt,
      pressure: sample.pressure,
    }))
    .sort((a, b) => a.dt - b.dt);

  if (valid.length < 2) {
    return { direction: null, difference: null, samples: valid };
  }

  const oldest = valid[0];
  const newest = valid[valid.length - 1];
  const difference = newest.pressure - oldest.pressure;

  let direction = "stable";
  if (difference > PRESSURE_TREND_THRESHOLD_HPA) {
    direction = "rising";
  } else if (difference < -PRESSURE_TREND_THRESHOLD_HPA) {
    direction = "falling";
  }

  return { direction, difference, samples: valid };
};
