/**
 * unsplashPhoto.js
 *
 * Fetches a cityscape/skyline photo from the Unsplash API for a given city.
 * Uses a progressive 5-tier fallback chain to maximise the chance of finding
 * a relevant image even for small/obscure cities:
 *
 *   Tier 0 — "{city} skyline"
 *   Tier 1 — "{city}" alone
 *   Tier 2 — "{state/region}" (if provided)
 *   Tier 3 — "{country} landscape"
 *   Tier 4 — generic weather-condition scenic query (e.g. "sunny desert landscape")
 *
 * Results are persisted to localStorage with a 30-day TTL so subsequent sessions
 * skip the network round-trips entirely, reducing pressure on Unsplash's free-tier
 * 50 req/hr rate limit.
 *
 * A module-level Map acts as an in-session in-memory cache on top of localStorage,
 * so components that re-render or re-mount within the same session never hit
 * localStorage or the network twice.
 *
 * Requires REACT_APP_UNSPLASH_KEY to be set in .env.
 * Attribution (photographer name + Unsplash link) is mandatory per API guidelines:
 * https://help.unsplash.com/api-guidelines/guideline-attribution
 */

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;
const LS_PREFIX = "weatherme:unsplash:";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Generic fallback queries by weather condition ───────────────────────────
// Keyed by the OWM `weather[0].main` string (see openweathermap.org/weather-conditions).
// Values are scenic/mood queries that will still return beautiful landscape photos
// even when no city-specific results exist.
const CONDITION_FALLBACK_QUERIES = {
  Clear:        "golden sunny landscape",
  Clouds:       "dramatic cloudy sky landscape",
  Rain:         "rainy city street moody",
  Drizzle:      "misty rain landscape",
  Thunderstorm: "lightning storm dramatic sky",
  Snow:         "snowy winter landscape serene",
  Mist:         "misty morning fog landscape",
  Smoke:        "hazy atmosphere landscape",
  Haze:         "hazy golden hour landscape",
  Dust:         "arid desert dusty landscape",
  Fog:          "foggy misty forest landscape",
  Sand:         "sandy desert dunes landscape",
  Ash:          "volcanic dramatic sky landscape",
  Squall:       "stormy ocean waves dramatic",
  Tornado:      "dramatic storm sky landscape",
};
const DEFAULT_CONDITION_QUERY = "beautiful city landscape scenic";

// ─── In-session memory cache ──────────────────────────────────────────────────
// cityKey → result-object | null | PENDING
const memCache = new Map();
const PENDING = Symbol("PENDING");

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsRead(cityKey) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + cityKey);
    if (!raw) return undefined; // not stored
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(LS_PREFIX + cityKey);
      return undefined; // expired
    }
    return data; // may be null (known miss) or a result object
  } catch {
    return undefined;
  }
}

function lsWrite(cityKey, data) {
  try {
    localStorage.setItem(LS_PREFIX + cityKey, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // Quota exceeded or private browsing — silently skip
  }
}

// ─── Single Unsplash search request ──────────────────────────────────────────

async function searchUnsplash(query) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=3&content_filter=high`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_KEY}`,
        "Accept-Version": "v1",
      },
    }
  );

  if (!res.ok) {
    // 403/429 = rate limited or bad key; propagate so callers can abort the chain
    throw Object.assign(new Error(`Unsplash HTTP ${res.status}`), { status: res.status });
  }

  const data = await res.json();
  return data; // { total, total_pages, results: [...] }
}

// ─── Build a result object from a raw Unsplash photo ─────────────────────────

function buildResult(photo) {
  const url = photo.urls?.regular ?? photo.urls?.full;
  if (!url) return null;
  return {
    url,
    photographerName: photo.user?.name ?? "Photographer",
    photographerLink: photo.user?.links?.html
      ? `${photo.user.links.html}?utm_source=weatherme&utm_medium=referral`
      : "https://unsplash.com?utm_source=weatherme&utm_medium=referral",
    unsplashLink: photo.links?.html
      ? `${photo.links.html}?utm_source=weatherme&utm_medium=referral`
      : "https://unsplash.com?utm_source=weatherme&utm_medium=referral",
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch a photo for the given city using the progressive fallback chain.
 *
 * @param {string} cityName        - e.g. "El Guerrara"
 * @param {object} [context]       - optional enrichment
 * @param {string} [context.state]   - state/region from geocoding, e.g. "Ghardaïa Province"
 * @param {string} [context.country] - country name/code, e.g. "Algeria" or "DZ"
 * @param {string} [context.weatherMain] - OWM weather main string, e.g. "Clear"
 *
 * @returns {Promise<{url, photographerName, photographerLink, unsplashLink} | null>}
 */
export async function fetchCityPhoto(cityName, context = {}) {
  if (!UNSPLASH_KEY || !cityName) return null;

  const cityKey = cityName.toLowerCase().trim();

  // 1. In-session memory cache
  if (memCache.has(cityKey)) {
    const cached = memCache.get(cityKey);
    if (cached === PENDING) return null; // still in flight — caller will get null; re-renders bring result
    return cached;
  }

  // 2. localStorage (cross-session persistence)
  const stored = lsRead(cityKey);
  if (stored !== undefined) {
    memCache.set(cityKey, stored);
    return stored; // may be null (known miss)
  }

  // 3. Mark as in-flight
  memCache.set(cityKey, PENDING);

  const { state, country, weatherMain } = context;

  // Build the country label — if it's a 2-letter ISO code, append "landscape" directly
  // otherwise use the country name as-is.
  const countryLabel = country ?? "";

  // Tier 4 generic fallback query
  const genericQuery =
    CONDITION_FALLBACK_QUERIES[weatherMain] ?? DEFAULT_CONDITION_QUERY;

  // Full ordered tier list
  const tiers = [
    { label: "T0: city skyline",     query: `${cityName} skyline` },
    { label: "T1: city alone",       query: cityName },
    state
      ? { label: "T2: state/region", query: state }
      : null,
    countryLabel
      ? { label: "T3: country landscape", query: `${countryLabel} landscape` }
      : null,
    { label: "T4: weather-condition generic", query: genericQuery },
  ].filter(Boolean);

  try {
    for (const tier of tiers) {
      let data;
      try {
        data = await searchUnsplash(tier.query);
      } catch (err) {
        if (err.status === 403 || err.status === 429) {
          // API key invalid or rate-limited — abort entire chain immediately
          console.warn(`[unsplashPhoto] Aborting chain (HTTP ${err.status})`);
          memCache.set(cityKey, null);
          lsWrite(cityKey, null);
          return null;
        }
        // Transient network error — skip this tier, try next
        console.warn(`[unsplashPhoto] ${tier.label} request failed, skipping:`, err.message);
        continue;
      }

      const total = data?.total ?? 0;
      const results = data?.results ?? [];

      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[unsplashPhoto] "${cityName}" | ${tier.label} | total=${total}, results=${results.length}`
        );
      }

      // Require at least 1 result with a usable URL
      const photo = results.find((p) => p.urls?.regular || p.urls?.full);
      if (!photo) continue;

      const result = buildResult(photo);
      if (!result) continue;

      if (process.env.NODE_ENV !== "production") {
        console.info(`[unsplashPhoto] "${cityName}" → matched at ${tier.label} | query: "${tier.query}"`);
      }

      memCache.set(cityKey, result);
      lsWrite(cityKey, result);
      return result;
    }

    // All tiers exhausted — no photo available; cache the miss
    if (process.env.NODE_ENV !== "production") {
      console.info(`[unsplashPhoto] "${cityName}" → no result at any tier, falling back to icon treatment`);
    }
    memCache.set(cityKey, null);
    lsWrite(cityKey, null);
    return null;

  } catch (err) {
    // Unexpected error in the loop itself
    console.warn("[unsplashPhoto] Unexpected error:", err);
    memCache.set(cityKey, null);
    // Don't persist unexpected errors to localStorage — allow retry next session
    return null;
  }
}
