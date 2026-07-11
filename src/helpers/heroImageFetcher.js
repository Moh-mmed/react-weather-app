/**
 * heroImageFetcher.js
 *
 * Reworked Hero panel imagery logic focusing on geographic accuracy over granularity.
 * 
 * Flow:
 * 1. Reverse-geocode (Nominatim) to find place type and state/wilaya.
 * 2. Determine scope: 
 *    - Major city -> `{city}, {country}`
 *    - Smaller town -> `{state/wilaya}, {country}`
 * 3. Fetch image from Wikimedia Commons using the resolved scope.
 * 4. Fallback: Generic weather-condition query via Unsplash.
 * 
 * Two levels of caching (localStorage + memory):
 * - Coord -> Scope
 * - Scope -> Image
 */

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_KEY;
const LS_SCOPE_PREFIX = "weatherme:scope:";
const LS_IMG_PREFIX = "weatherme:hero_img:";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const isDev = process.env.NODE_ENV !== "production";

// ─── Generic fallback queries by weather condition (Unsplash) ───────────────
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

// ─── ISO country code → full English name ────────────────────────────────────
let _displayNames = null;
function getDisplayNames() {
  if (!_displayNames) {
    try {
      _displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      _displayNames = { of: (code) => code };
    }
  }
  return _displayNames;
}

function expandCountryCode(code) {
  if (!code) return null;
  if (code.length > 3) return code;
  try {
    const name = getDisplayNames().of(code.toUpperCase());
    return name ?? code;
  } catch {
    return code;
  }
}

// ─── Caches ───────────────────────────────────────────────────────────────────
const memScopeCache = new Map();
const memImgCache = new Map();
const PENDING = Symbol("PENDING");

function lsRead(prefix, key) {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (!raw) return undefined;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(prefix + key);
      return undefined;
    }
    return data;
  } catch {
    return undefined;
  }
}

function lsWrite(prefix, key, data) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// ─── 1. Nominatim Reverse Geocoding ──────────────────────────────────────────

async function resolveScope(lat, lon, cityName, countryCode) {
  // We use 3 decimal places for coordinate caching to group nearby locations
  const coordKey = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
  
  if (memScopeCache.has(coordKey)) {
    const cached = memScopeCache.get(coordKey);
    if (cached !== PENDING) return cached;
  }
  const stored = lsRead(LS_SCOPE_PREFIX, coordKey);
  if (stored !== undefined) {
    memScopeCache.set(coordKey, stored);
    return stored;
  }

  memScopeCache.set(coordKey, PENDING);
  const countryFull = expandCountryCode(countryCode) || countryCode;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "WeatherMe React App - Development",
          "Accept-Language": "en"
        }
      }
    );

    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    
    const placeType = data.addresstype || data.type || data.class;
    const address = data.address || {};
    const state = address.state || address.province || address.region;
    
    let scopeType = "region";
    let scopeName = state || countryFull; // fallback to country if no state
    
    if (placeType === "city" || placeType === "administrative") {
        // If it's explicitly a major city, use city scope
        scopeType = "city";
        scopeName = address.city || address.town || cityName;
    }

    const result = {
      scopeType,
      scopeName,
      countryFull,
      state // keep state handy
    };

    memScopeCache.set(coordKey, result);
    lsWrite(LS_SCOPE_PREFIX, coordKey, result);
    return result;

  } catch (err) {
    console.warn("[heroImageFetcher] Nominatim failed, falling back to city defaults:", err);
    // Fallback: assume city scope
    const result = { scopeType: "city", scopeName: cityName, countryFull };
    memScopeCache.set(coordKey, result);
    return result;
  }
}

// ─── 2. Wikimedia Commons Fetcher ─────────────────────────────────────────────

async function queryCommonsCategory(categoryName) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(categoryName)}&cmtype=file&cmlimit=50&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.query?.categorymembers || [];
}

async function getCommonsImageUrl(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const imageinfo = page?.imageinfo?.[0];
  if (!imageinfo) return null;
  
  const artist = imageinfo.extmetadata?.Artist?.value || "Wikimedia Commons Contributor";
  // Strip HTML from artist if present
  const cleanArtist = artist.replace(/<[^>]+>/g, '').trim();

  return {
    url: imageinfo.url,
    photographerName: cleanArtist,
    photographerLink: page.imageinfo[0].descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`,
    unsplashLink: null, // to distinguish from Unsplash attribution
    source: "commons"
  };
}

async function fetchFromCommons(scopeName, countryFull) {
  // Try combinations for category naming
  const categoriesToTry = [
    `${scopeName}, ${countryFull}`,
    `${scopeName} (${countryFull})`,
    scopeName
  ];

  for (const cat of categoriesToTry) {
    if (!cat) continue;
    const members = await queryCommonsCategory(cat);
    
    // Filter out obvious non-photos
    const validPhotos = members.filter(m => {
      const title = m.title.toLowerCase();
      if (!title.match(/\.(jpe?g|png)$/i)) return false;
      if (title.match(/flag|map|coat_of_arms|logo|seal|locator|blason|emblem|icon|diagram/)) return false;
      return true;
    });

    if (validPhotos.length > 0) {
      // Pick a random one from the top 5 to avoid always showing the same if we want variety,
      // or just pick the first one. Let's pick the first valid one.
      for (const photo of validPhotos) {
        const imgData = await getCommonsImageUrl(photo.title);
        if (imgData) return imgData;
      }
    }
  }
  return null;
}

// ─── 3. Unsplash Fallback (Weather Condition) ─────────────────────────────────

async function fetchUnsplashFallback(weatherMain) {
  if (!UNSPLASH_KEY) return null;
  
  const query = CONDITION_FALLBACK_QUERIES[weatherMain] ?? DEFAULT_CONDITION_QUERY;
  
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=3&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`,
          "Accept-Version": "v1",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || [];
    const photo = results.find((p) => p.urls?.regular || p.urls?.full);
    
    if (!photo) return null;
    
    const url = photo.urls?.regular ?? photo.urls?.full;
    return {
      url,
      photographerName: photo.user?.name ?? "Photographer",
      photographerLink: photo.user?.links?.html
        ? `${photo.user.links.html}?utm_source=weatherme&utm_medium=referral`
        : "https://unsplash.com?utm_source=weatherme&utm_medium=referral",
      unsplashLink: photo.links?.html
        ? `${photo.links.html}?utm_source=weatherme&utm_medium=referral`
        : "https://unsplash.com?utm_source=weatherme&utm_medium=referral",
      source: "unsplash"
    };
  } catch (err) {
    return null;
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Fetch a hero image prioritizing geographic accuracy using Nominatim & Wikimedia Commons.
 *
 * @param {string} cityName 
 * @param {object} context 
 * @param {number} context.lat
 * @param {number} context.lon
 * @param {string} context.country 
 * @param {string} context.weatherMain
 *
 * @returns {Promise<{url, photographerName, photographerLink, unsplashLink, source} | null>}
 */
export async function fetchHeroImage(cityName, context = {}) {
  const { lat, lon, country, weatherMain } = context;
  if (!lat || !lon) return null;

  // 1. Resolve scope
  const scopeData = await resolveScope(lat, lon, cityName, country);
  if (scopeData === PENDING) return null; // Component will re-render
  
  const cacheKey = `${scopeData.scopeName}:${scopeData.countryFull}`.toLowerCase();

  // 2. Check image cache
  if (memImgCache.has(cacheKey)) {
    const cached = memImgCache.get(cacheKey);
    if (cached === PENDING) return null;
    return cached;
  }

  const stored = lsRead(LS_IMG_PREFIX, cacheKey);
  if (stored !== undefined) {
    memImgCache.set(cacheKey, stored);
    if (isDev && stored) {
        console.info(`[hero-image] CACHE HIT | scope: ${scopeData.scopeType} '${scopeData.scopeName}', source: ${stored.source}`);
    }
    return stored;
  }

  memImgCache.set(cacheKey, PENDING);

  // 3. Fetch from Wikimedia Commons
  let result = null;

  if (isDev) {
    console.debug(`[hero-image] Resolving | placeType: ${scopeData.scopeType}, scopeName: '${scopeData.scopeName}'`);
  }

  // Try scope level (city or state)
  result = await fetchFromCommons(scopeData.scopeName, scopeData.countryFull);
  
  if (result) {
    if (isDev) console.info(`[hero-image] SUCCESS | scope: ${scopeData.scopeType} '${scopeData.scopeName}', source: commons-category`);
  }

  // 4. Fallback to Country level on Commons if state/city failed
  if (!result && scopeData.countryFull && scopeData.scopeName !== scopeData.countryFull) {
    if (isDev) console.debug(`[hero-image] Fallback to country level: '${scopeData.countryFull}'`);
    result = await fetchFromCommons(scopeData.countryFull, ""); // empty country context to just search "Category:Algeria"
    if (result && isDev) {
        console.info(`[hero-image] SUCCESS | scope: country '${scopeData.countryFull}', source: commons-category`);
    }
  }

  // 5. Final fallback to generic weather condition on Unsplash
  if (!result) {
    if (isDev) console.debug(`[hero-image] Fallback to generic weather condition: '${weatherMain}'`);
    result = await fetchUnsplashFallback(weatherMain);
    if (result && isDev) {
        console.info(`[hero-image] SUCCESS | scope: generic '${weatherMain}', source: unsplash`);
    }
  }

  if (!result && isDev) {
      console.info(`[hero-image] FAILED | no image found at any tier, falling back to icon treatment`);
  }

  // Cache and return (even if null, to avoid re-fetching misses)
  memImgCache.set(cacheKey, result);
  lsWrite(LS_IMG_PREFIX, cacheKey, result);
  return result;
}

export function clearHeroImageCache() {
  memScopeCache.clear();
  memImgCache.clear();
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(LS_SCOPE_PREFIX) || k.startsWith(LS_IMG_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}
