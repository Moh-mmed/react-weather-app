import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchHeroImage,
  clearHeroImageCache,
} from "../../helpers/heroImageFetcher";
import clsx from "clsx";
import NavBarForm from "../Main/NavBar/NavBarForm";
import HeroPanel from "./HeroPanel";
import HourlyOutlook from "./HourlyOutlook";
import StatsGrid from "./StatsGrid";
import SunPositionPanel from "./SunPositionPanel";
import AirQualityPanel from "./AirQualityPanel";
import ForecastList from "./ForecastList";
import { formatTime24 } from "../../helpers/timeFormat";

// ─── One-time cache bust & migration ──────────────────────────────────────────
const CACHE_VERSION = "3-commons";
const CACHE_VERSION_KEY = "weatherme:img_cache_v";
(() => {
  try {
    const stored = localStorage.getItem(CACHE_VERSION_KEY);
    if (stored !== CACHE_VERSION) {
      clearHeroImageCache();
      // Clean up old Unsplash caches to free space
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("weatherme:unsplash")) {
          localStorage.removeItem(k);
        }
      });
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    }
  } catch {
    /* localStorage unavailable */
  }
})();

// ─── Brand icon ──────────────────────────────────────────────────────────────
const BrandIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="30"
    height="30"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" stroke="#F4A93B" strokeWidth="1.6" />
    <g stroke="#4FA3D9" strokeWidth="1.6" strokeLinecap="round">
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
      <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
      <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
      <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
    </g>
  </svg>
);

// ─── Language Switcher ────────────────────────────────────────────────────────
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLang = rawLang === "fr" ? "fr" : rawLang === "ar" ? "ar" : "en";

  return (
    <div className="flex items-center bg-white/5 border border-panel-line rounded-full p-0.5 text-[11px] font-mono select-none" dir="ltr">
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        aria-label="Switch to English"
        className={clsx(
          "px-2 py-0.5 rounded-full transition-colors duration-150 cursor-pointer",
          activeLang === "en"
            ? "bg-accent-sky text-navy-dark font-semibold shadow-sm"
            : "text-muted hover:text-primary",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("fr")}
        aria-label="Passer en Français"
        className={clsx(
          "px-2 py-0.5 rounded-full transition-colors duration-150 cursor-pointer",
          activeLang === "fr"
            ? "bg-accent-sky text-navy-dark font-semibold shadow-sm"
            : "text-muted hover:text-primary",
        )}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("ar")}
        aria-label="التحويل إلى العربية"
        className={clsx(
          "px-2 py-0.5 rounded-full transition-colors duration-150 cursor-pointer",
          activeLang === "ar"
            ? "bg-accent-sky text-navy-dark font-semibold shadow-sm"
            : "text-muted hover:text-primary",
        )}
      >
        AR
      </button>
    </div>
  );
};

// ─── Ko-fi donation button ────────────────────────────────────────────────────
const KofiButton = () => (
  <a
    href="https://ko-fi.com/mohammedbenomr"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Support on Ko-fi"
    className={clsx(
      "flex items-center gap-1.5",
      "bg-white/5 border border-panel-line rounded-full",
      "px-2.5 py-1 text-[11px] font-mono text-muted select-none",
      "transition-all duration-150",
      "hover:bg-white/10 hover:border-white/15 hover:text-primary hover:brightness-110 hover:scale-[1.04]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-sky/60 focus-visible:outline-offset-2",
    )}
  >
    {/* Thin-stroke coffee-cup icon — matches the line-art style used across the app */}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      {/* Cup body */}
      <path d="M5 7h11a1 1 0 0 1 1 1v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8a1 1 0 0 1 1-1z" />
      {/* Handle */}
      <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
      {/* Steam wisps */}
      <path d="M9 4c0-1 .6-1.5 1-2" />
      <path d="M13 4c0-1 .6-1.5 1-2" />
    </svg>
    {/* Label hidden on mobile, visible on tablet+ */}
    <span className="hidden tablet:inline">Support</span>
  </a>
);

// ─── Live clock ───────────────────────────────────────────────────────────────
const LiveClock = ({ timezoneOffset }) => {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLocale = rawLang === "fr" ? "fr-FR" : rawLang === "ar" ? "ar-EG" : "en-US";
  const localDate = new Date((now + (timezoneOffset || 0)) * 1000);

  const dayName = new Intl.DateTimeFormat(activeLocale, {
    weekday: "short",
    timeZone: "UTC",
  }).format(localDate);
  const dayNum = new Intl.DateTimeFormat(activeLocale, {
    day: "2-digit",
    timeZone: "UTC",
    numberingSystem: "latn",
  }).format(localDate);
  const monthName = new Intl.DateTimeFormat(activeLocale, {
    month: "short",
    timeZone: "UTC",
  }).format(localDate);

  const dayLabel = `${dayName} ${dayNum} ${monthName}`.toUpperCase();
  const clock = formatTime24(now, timezoneOffset);

  return (
    <>
      {dayLabel} · {clock}
    </>
  );
};

// ─── Inline page-level spinner ────────────────────────────────────────────────
const PageSpinner = () => (
  <div className="flex-1 flex items-center justify-center min-h-[300px]">
    <svg
      className="motion-safe:animate-spin h-10 w-10 text-accent-sky opacity-60"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading weather data"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);

// ─── Dashboard grid for one location ─────────────────────────────────────────
const LocationPage = ({ page, onRemove }) => {
  const { weatherData, airQuality, isPinned } = page;

  // ── Unsplash city photo ───────────────────────────────────────────────────
  // Fetch once per city name; the helper’s cache means this is a no-op on
  // re-renders and page switches if we’’ve already fetched it this session.
  const [cityPhoto, setCityPhoto] = useState(null);

  useEffect(() => {
    if (!page.city) return;
    let cancelled = false;
    // Build the context bag for the Nominatim + Commons fallback chain:
    //   • lat, lon   — required for Nominatim reverse-geocoding
    //   • country    — always present
    //   • weatherMain — OWM condition string for the generic tier fallback
    const weatherMain = weatherData?.current?.weather?.[0]?.main ?? null;
    fetchHeroImage(page.city, {
      lat: page.lat ?? null,
      lon: page.lon ?? null,
      country: page.country ?? null,
      weatherMain,
    }).then((result) => {
      if (!cancelled) setCityPhoto(result);
    });
    return () => {
      cancelled = true;
    };
    // Re-fetch only when the city changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.city]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!weatherData || !airQuality) {
    return <PageSpinner />;
  }

  return (
    <main
      key={`${weatherData.coord?.lat}-${weatherData.coord?.lon}-${weatherData.dt}`}
      className="dashboard-main flex-1 grid gap-5 min-h-0 animate-fadeIn"
      style={{ gridTemplateColumns: "2.05fr 1fr" }}
    >
      {/* Left column */}
      <div
        className="dashboard-column grid gap-5 min-h-0"
        style={{ gridTemplateRows: "auto auto 1fr" }}
      >
        <HeroPanel
          weatherData={weatherData}
          isPinned={isPinned}
          onRemove={onRemove}
          cityPhoto={cityPhoto}
        />
        <HourlyOutlook weatherData={weatherData} />
        <ForecastList weatherData={weatherData} />
      </div>

      {/* Right column */}
      <div
        className="dashboard-column grid gap-5 min-h-0"
        style={{ gridTemplateRows: "auto auto 1fr" }}
      >
        <SunPositionPanel weatherData={weatherData} />
        <AirQualityPanel airQuality={airQuality} />
        <StatsGrid weatherData={weatherData} />
      </div>
    </main>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({
  weatherData,
  airQuality,
  currCity,
  cityNotFound,
  isUpdatingLocation,
  handleSearchCity,
  handleWeatherData,
  handleAirQuality,
  handleCurrCity,
  handleGeoCoords,
  // Multi-location paging
  allPages = [],
  activeIndex = 0,
  setActiveIndex,
  savedLocations = [],
  handleAddSavedLocation,
  handleRemoveLocation,
}) => {
  // ── Paging scroll container ref ─────────────────────────────────────────────
  const pagerRef = useRef(null);
  const scrollRafRef = useRef(0);
  // Prevent a programmatic scroll from re-triggering setActiveIndex
  const isProgrammaticScrollRef = useRef(false);

  // ── Derived header values from the active page ───────────────────────────────
  const activePage = allPages[activeIndex];
  const activeWeatherData = activePage?.weatherData || weatherData;
  const activeCurrCity = activePage
    ? { city: activePage.city, country: activePage.country }
    : currCity;

  const timezone_offset = activeWeatherData?.timezone_offset ?? 0;
  const activeTemp = activeWeatherData?.current?.temp;
  const safeTemp = Number.isFinite(activeTemp) ? Math.round(activeTemp) : "--";
  const { city, country } = activeCurrCity || {};

  const { t } = useTranslation();

  // Is the current page already in savedLocations?
  const isCurrentPageSaved =
    activeIndex === 0 &&
    savedLocations.some(
      (loc) =>
        Math.abs(loc.lat - (allPages[0]?.lat ?? 0)) < 0.01 &&
        Math.abs(loc.lon - (allPages[0]?.lon ?? 0)) < 0.01,
    );

  // ── Imperatively scroll to activeIndex when it changes programmatically ──────
  useEffect(() => {
    const pager = pagerRef.current;
    if (!pager) return;
    const isRtl = document.documentElement.dir === "rtl";
    const targetScrollLeft = isRtl ? -activeIndex * pager.clientWidth : activeIndex * pager.clientWidth;
    if (Math.abs(Math.abs(pager.scrollLeft) - activeIndex * pager.clientWidth) < 2) return;
    isProgrammaticScrollRef.current = true;
    pager.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    // Clear the flag after the animation would have finished (~450 ms)
    const t = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
    return () => clearTimeout(t);
  }, [activeIndex]);

  // ── Sync activeIndex from native scroll (swipe / trackpad) ──────────────────
  const handleScroll = useCallback(() => {
    const pager = pagerRef.current;
    if (!pager) return;
    if (isProgrammaticScrollRef.current) return;
    window.cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = window.requestAnimationFrame(() => {
      const idx = Math.round(Math.abs(pager.scrollLeft) / pager.clientWidth);
      const clamped = Math.max(0, Math.min(idx, allPages.length - 1));
      setActiveIndex((prev) => (prev !== clamped ? clamped : prev));
    });
  }, [allPages.length, setActiveIndex]);



  // ── Page dot click: scroll to page ──────────────────────────────────────────
  const scrollToPage = useCallback(
    (idx) => {
      setActiveIndex(idx);
      // Imperatively scroll too (the useEffect above fires but only after re-render)
      const pager = pagerRef.current;
      if (pager) {
        isProgrammaticScrollRef.current = true;
        const isRtl = document.documentElement.dir === "rtl";
        const targetScrollLeft = isRtl ? -idx * pager.clientWidth : idx * pager.clientWidth;
        pager.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      }
    },
    [setActiveIndex],
  );

  // ── Header: add-to-saved button (only visible on page 0, when unsaved) ───────
  const handleAddCurrentToSaved = () => {
    if (!allPages[0] || !handleAddSavedLocation) return;
    const p = allPages[0];
    handleAddSavedLocation({
      city: p.city,
      country: p.country,
      lat: p.lat,
      lon: p.lon,
    });
  };

  const showAddBtn =
    activeIndex === 0 && !isCurrentPageSaved && handleAddSavedLocation;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    /* Root: full-height flex column, strictly contained — no vertical overflow anywhere.
       On small screens each page scrolls vertically inside the pager via overflow-y-auto. */
    <div
      className="flex flex-col text-primary bg-dashboard-radial pt-7 pb-5 gap-5"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {/* ── Fixed header — horizontal padding lives here ───────────────────── */}
      <header className="flex items-center justify-between gap-4 flex-wrap px-[clamp(20px,4vw,48px)] shrink-0">
        {/* Brand + secondary header actions cluster */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <BrandIcon />
            <div className="font-display font-semibold text-[20px] tracking-[0.2px]">
              Weather<em className="italic text-accent-sun">Me</em>
            </div>
          </div>
          {/* Language toggle + Ko-fi grouped together as secondary header actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <KofiButton />
          </div>
        </div>

        {/* Search form — grows to fill available space, min-w prevents it collapsing to icon-only */}
        <NavBarForm
          cityNotFound={cityNotFound}
          handleSearchCity={handleSearchCity}
          handleWeatherData={handleWeatherData}
          handleAirQuality={handleAirQuality}
          handleCurrCity={handleCurrCity}
          handleGeoCoords={handleGeoCoords}
          isUpdatingLocation={isUpdatingLocation}
          handleAddSavedLocation={handleAddSavedLocation}
          savedLocations={savedLocations}
        />

        {/* Headline: date + city + temp */}
        <div className="flex items-center gap-3.5 text-right max-desktop:text-left">
          <div className="flex flex-col justify-center text-left">
            <div className="text-[13px] leading-[1.25] text-muted font-mono tracking-[0.4px] uppercase">
              {activeWeatherData ? (
                <LiveClock timezoneOffset={timezone_offset} />
              ) : (
                <span className="opacity-40">-- : --</span>
              )}
            </div>
            <div className="text-[14px] leading-[1.25] font-semibold flex items-center gap-1.5">
              {city}, {country}
              {/* Add to saved locations button */}
              {showAddBtn && (
                <button
                  type="button"
                  title={t("header.saveThisLocation")}
                  onClick={handleAddCurrentToSaved}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-accent-sky/20 border border-white/10 hover:border-accent-sky/40 flex items-center justify-center transition-all duration-150 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    width="10"
                    height="10"
                    className="text-accent-sky"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center font-display font-semibold text-[32px] leading-none text-accent-sky">
            {safeTemp}°C
          </div>
        </div>
      </header>

      {/* ── Horizontal paging scroll container ────────────────────────────── */}
      <div
        ref={pagerRef}
        onScroll={handleScroll}
        aria-label="Weather locations"
        style={{
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
        }}
        className="flex flex-1 min-h-0 overflow-x-auto no-scrollbar snap-x snap-mandatory touch-pan-x"
      >
        {allPages.map((page, idx) => (
          <div
            key={`${page.lat ?? "pinned"}-${page.lon ?? "pinned"}-${idx}`}
            className="flex-none w-full min-w-full snap-start snap-always flex flex-col px-[clamp(20px,4vw,48px)] overflow-y-auto"
          >
            <LocationPage
              page={page}
              onRemove={
                !page.isPinned && handleRemoveLocation
                  ? () => {
                      handleRemoveLocation(page.lat, page.lon);
                      // scroll back to the previous page
                      const prevIdx = Math.max(0, activeIndex - 1);
                      scrollToPage(prevIdx);
                    }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {/* ── Page indicator dots ────────────────────────────────────────────── */}
      {allPages.length > 1 && (
        <div
          className="fixed bottom-5 left-0 right-0 flex items-center justify-center pointer-events-none z-30"
          aria-label="Location pages"
        >
          <div className="flex items-center gap-[7px] pointer-events-auto bg-black/25 backdrop-blur-sm rounded-full px-3 py-2">
            {allPages.map((page, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                aria-label={`Go to ${page.city || "location"}`}
                aria-pressed={activeIndex === idx}
                onClick={() => scrollToPage(idx)}
                className={clsx(
                  "rounded-full transition-all duration-200 ease-out border-0 cursor-pointer",
                  "hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-sky/70 focus-visible:outline-offset-[3px]",
                  activeIndex === idx
                    ? "w-5 h-[7px] bg-accent-sky opacity-100"
                    : "w-[7px] h-[7px] bg-white/50 opacity-60 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
