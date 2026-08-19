import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import NavBarForm from "../Main/NavBar/NavBarForm";
import OverviewSection from "./OverviewSection";
import { formatTime } from "../../helpers/timeFormat";
import { useUnit } from "../../contexts/UnitContext";
import { useTimeFormat } from "../../contexts/TimeFormatContext";
import { useTheme } from "../../contexts/ThemeContext";

const SECONDARY_ACTION_CLASS = clsx(
  "flex h-[30px] items-center rounded-full",
  "bg-white/5 border border-panel-line text-muted select-none",
  "transition-all duration-150",
  "hover:bg-white/10 hover:border-white/15 hover:text-primary hover:brightness-110 hover:scale-[1.04]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-sky/60 focus-visible:outline-offset-2",
);

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
const SettingsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path d="M4 6h5" />
    <path d="M15 6h5" />
    <circle cx="12" cy="6" r="2.25" />
    <path d="M4 12h2.5" />
    <path d="M12.5 12H20" />
    <circle cx="9.5" cy="12" r="2.25" />
    <path d="M4 18h8" />
    <path d="M18 18h2" />
    <circle cx="15" cy="18" r="2.25" />
  </svg>
);

const LocationPinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="13"
    height="13"
    aria-hidden="true"
  >
    <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11z" />
    <circle cx="12" cy="10" r="2" />
  </svg>
);

const SettingsSegment = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
      {label}
    </span>
    <div
      className="flex items-center rounded-full border border-panel-line bg-white/5 p-0.5 text-[11px] font-mono"
      dir="ltr"
    >
      {children}
    </div>
  </div>
);

const SettingsOption = ({ active, disabled = false, onClick, children }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={clsx(
      "px-2.5 py-1 rounded-full transition-colors duration-150",
      disabled ? "cursor-not-allowed text-muted/35" : "cursor-pointer",
      active
        ? "bg-accent-sky text-navy-dark font-semibold shadow-sm"
        : "text-muted hover:text-primary",
    )}
  >
    {children}
  </button>
);

// ─── Header settings menu ────────────────────────────────────────────────────
const SettingsMenu = () => {
  const { t, i18n } = useTranslation();
  const { unitSystem, setUnitSystem } = useUnit();
  const { hourFormat, setHourFormat } = useTimeFormat();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const activeLang = i18n.language?.slice(0, 2).toLowerCase() || "en";

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label={t("header.settings")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className={clsx(SECONDARY_ACTION_CLASS, "justify-center px-3")}
      >
        <SettingsIcon />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+10px)] z-30 w-[min(280px,calc(100vw-40px))] rounded-2xl border border-panel-line bg-navy-panel/95 p-3.5 shadow-[0_16px_38px_rgba(0,0,0,0.42)] backdrop-blur-md max-tablet:left-auto max-tablet:right-0"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-[15px] font-semibold text-primary">
              {t("header.settings")}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <SettingsSegment label={t("header.language")}>
              <SettingsOption
                active={activeLang === "en"}
                onClick={() => i18n.changeLanguage("en")}
              >
                EN
              </SettingsOption>
              <SettingsOption
                active={activeLang === "fr"}
                onClick={() => i18n.changeLanguage("fr")}
              >
                FR
              </SettingsOption>
              <SettingsOption
                active={activeLang === "ar"}
                onClick={() => i18n.changeLanguage("ar")}
              >
                AR
              </SettingsOption>
            </SettingsSegment>

            <SettingsSegment label={t("header.units")}>
              <SettingsOption
                active={unitSystem === "metric"}
                onClick={() => setUnitSystem("metric")}
              >
                °C
              </SettingsOption>
              <SettingsOption
                active={unitSystem === "imperial"}
                onClick={() => setUnitSystem("imperial")}
              >
                °F
              </SettingsOption>
            </SettingsSegment>

            <SettingsSegment label={t("header.hourFormat")}>
              <SettingsOption
                active={hourFormat === "24h"}
                onClick={() => setHourFormat("24h")}
              >
                24H
              </SettingsOption>
              <SettingsOption
                active={hourFormat === "12h"}
                onClick={() => setHourFormat("12h")}
              >
                12H
              </SettingsOption>
            </SettingsSegment>

            <SettingsSegment label={t("header.appearance")}>
              <SettingsOption
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </SettingsOption>
              <SettingsOption
                active={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </SettingsOption>
            </SettingsSegment>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Ko-fi donation button ────────────────────────────────────────────────────
const KofiButton = () => {
  const { t } = useTranslation();
  return (
    <a
      href="https://ko-fi.com/mohammedbenomr"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("dashboard.supportAria", {
        defaultValue: "Support on Ko-fi",
      })}
      className={clsx(
        SECONDARY_ACTION_CLASS,
        "gap-1.5 px-2.5 text-[11px] font-mono",
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
      <span className="hidden tablet:inline">
        {t("dashboard.support", { defaultValue: "Support" })}
      </span>
    </a>
  );
};

// ─── GitHub repo badge ────────────────────────────────────────────────────────
const GitHubBadge = () => {
  return (
    <a
      href="https://github.com/Moh-mmed/react-weather-app"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub Repository"
      className={clsx(SECONDARY_ACTION_CLASS, "px-2 py-1.5")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    </a>
  );
};

// ─── Live clock ───────────────────────────────────────────────────────────────
const LiveClock = ({ timezoneOffset, currentTime }) => {
  const { i18n } = useTranslation();
  const { hourFormat } = useTimeFormat();

  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLocale =
    rawLang === "fr" ? "fr-FR" : rawLang === "ar" ? "ar-EG" : "en-US";
  const localDate = new Date((currentTime + (timezoneOffset || 0)) * 1000);

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
  const clock = formatTime(currentTime, timezoneOffset, hourFormat);

  return (
    <>
      {dayLabel} · {clock}
    </>
  );
};

// ─── Inline page-level spinner ────────────────────────────────────────────────
const LocationPage = ({ page, onRemove, currentTime, hasMultiplePages }) => {
  const { weatherData, airQuality, city } = page;
  const { t } = useTranslation();

  if (!weatherData || !airQuality) {
    // City data is loaded lazily on swipe — missing data means "fetching",
    // not "failed", so show a lightweight loading state.
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <svg
          className="motion-safe:animate-spin h-9 w-9 text-accent-sky"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-muted text-sm opacity-60 max-w-[220px] leading-relaxed">
          {city
            ? t("dashboard.loadingFor", {
                city,
                defaultValue: `Loading weather for ${city}…`,
              })
            : t("dashboard.loadingData", {
                defaultValue: "Loading weather data…",
              })}
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex-1 w-full overflow-y-auto scroll-smooth no-scrollbar",
        hasMultiplePages ? "pb-16" : "pb-0",
      )}
    >
      {/* Section 1: Overview */}
      <div className="w-full">
        <OverviewSection
          page={page}
          currentTime={currentTime}
          onRemove={onRemove}
        />
        <div className="flex justify-start pt-2">
          <WebsiteBadge />
        </div>
      </div>
    </div>
  );
};

// ─── Portfolio badge ──────────────────────────────────────────────────────────
const WebsiteBadge = () => {
  const { t } = useTranslation();
  return (
    <a
      href="https://benaoumeur-mohammed.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("dashboard.portfolioAria", {
        defaultValue: "Mohammed Ben Aoumeur — Portfolio",
      })}
      className={clsx(
        SECONDARY_ACTION_CLASS,
        "gap-1.5 px-2.5 text-[11px] font-mono !bg-white/10",
      )}
    >
      {/* Globe icon — thin-stroke line-art matching the app's icon style */}
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
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
      {/* Label always visible, smaller on mobile */}
      <span className="inline max-mobile:text-[9px]">
        Built by <span className="font-semibold">Mohammed Benaoumeur</span>
      </span>
    </a>
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
  // Stale / offline data
  usingCachedData = false,
  lastUpdatedAt = null,
}) => {
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000),
  );
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (usingCachedData) {
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [usingCachedData, lastUpdatedAt]);

  // ── Paging scroll container ref ─────────────────────────────────────────────
  const pagerRef = useRef(null);
  const scrollRafRef = useRef(0);
  // Prevent a programmatic scroll from re-triggering setActiveIndex
  const isProgrammaticScrollRef = useRef(false);

  // ── Derived header values from the active page ───────────────────────────────
  const activePage = allPages[activeIndex];
  const activeWeatherData = activePage?.weatherData;
  const activeCurrCity = activePage
    ? { city: activePage.city, country: activePage.country }
    : currCity;

  const { convertTemp, unitSystem } = useUnit();
  const timezone_offset = activeWeatherData?.timezone_offset ?? 0;
  const activeTemp = activeWeatherData?.current?.temp;
  const safeTemp = Number.isFinite(activeTemp) ? convertTemp(activeTemp) : "--";
  const { city, country } = activeCurrCity || {};

  const { t, i18n } = useTranslation();

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
    const targetScrollLeft = isRtl
      ? -activeIndex * pager.clientWidth
      : activeIndex * pager.clientWidth;
    if (
      Math.abs(Math.abs(pager.scrollLeft) - activeIndex * pager.clientWidth) < 2
    )
      return;
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
        const targetScrollLeft = isRtl
          ? -idx * pager.clientWidth
          : idx * pager.clientWidth;
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

  // ── Format the last-updated timestamp for the stale-data banner ─────────────
  const rawLang = i18n.language?.slice(0, 2).toLowerCase();
  const activeLocale =
    rawLang === "fr" ? "fr-FR" : rawLang === "ar" ? "ar-EG" : "en-US";
  const lastUpdatedLabel = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString(activeLocale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    /* Root: full-height flex column, strictly contained — no vertical overflow anywhere.
       On small screens each page scrolls vertically inside the pager via overflow-y-auto. */
    <div
      className="flex min-h-screen flex-col text-primary bg-dashboard-radial pt-7 gap-5"
      style={{ overflowX: "hidden" }}
    >
      {/* ── Stale data banner ────────────────────────────────────────────────── */}
      {lastUpdatedLabel && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "14px",
            left: "50%",
            transform: showBanner
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(-10px)",
            opacity: showBanner ? 1 : 0,
            transition:
              "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "none",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 14px 5px 10px",
            borderRadius: "999px",
            background: "rgba(255,183,77,0.10)",
            border: "1px solid rgba(255,183,77,0.28)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          {/* Wifi-off icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFB74D"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="14"
            height="14"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: 500,
              color: "#FFB74D",
              letterSpacing: "0.2px",
            }}
          >
            {t("dashboard.lastUpdated", {
              time: lastUpdatedLabel,
              defaultValue: `Last updated ${lastUpdatedLabel}`,
            })}
          </span>
        </div>
      )}
      {/* ── Content container — max-width + centered ──────────────────────── */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col flex-1 gap-5">
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
            {/* Secondary header actions */}
            <div className="flex items-center gap-2 shrink-0">
              <KofiButton />
              <GitHubBadge />
              <SettingsMenu />
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
                  <LiveClock
                    timezoneOffset={timezone_offset}
                    currentTime={currentTime}
                  />
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
              {safeTemp}°{unitSystem === "imperial" ? "F" : "C"}
            </div>
          </div>
        </header>

        {/* ── Horizontal paging scroll container ────────────────────────────── */}
        <div
          ref={pagerRef}
          onScroll={handleScroll}
          aria-label={t("dashboard.locations", {
            defaultValue: "Weather locations",
          })}
          style={{
            overscrollBehaviorX: "contain",
            WebkitOverflowScrolling: "touch",
          }}
          className="flex flex-1 min-h-0 overflow-x-auto no-scrollbar snap-x snap-mandatory touch-pan-x"
        >
          {allPages.map((page, idx) => (
            <div
              key={`${page.lat ?? "pinned"}-${page.lon ?? "pinned"}-${idx}`}
              className="flex-none w-full min-w-full snap-start snap-always flex flex-col px-[clamp(20px,4vw,48px)] overflow-hidden min-h-0"
            >
              <LocationPage
                page={page}
                currentTime={currentTime}
                hasMultiplePages={allPages.length > 1}
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
      </div>

      {/* ── Page indicator dots ────────────────────────────────────────────── */}
      {allPages.length > 1 && (
        <div
          className="fixed left-0 right-0 flex items-center justify-center pointer-events-none z-30 location-dots"
          aria-label={t("dashboard.locationPages", {
            defaultValue: "Location pages",
          })}
        >
          <div className="flex items-center gap-[7px] pointer-events-auto bg-black/25 backdrop-blur-sm rounded-full px-3 py-2">
            {allPages.map((page, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                title={
                  idx === 0
                    ? t("dashboard.currentLocation", {
                        defaultValue: "Current location",
                      })
                    : page.city ||
                      t("dashboard.savedLocation", {
                        defaultValue: "Saved location",
                      })
                }
                aria-label={
                  idx === 0
                    ? t("dashboard.goToCurrent", {
                        defaultValue: "Go to current location",
                      })
                    : t("dashboard.goToSaved", {
                        city:
                          page.city ||
                          t("dashboard.savedLocation", {
                            defaultValue: "Saved location",
                          }),
                        defaultValue: `Go to ${page.city || "saved location"}`,
                      })
                }
                aria-pressed={activeIndex === idx}
                onClick={() => scrollToPage(idx)}
                className={clsx(
                  "rounded-full transition-all duration-200 ease-out border-0 cursor-pointer flex items-center justify-center",
                  "hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-sky/70 focus-visible:outline-offset-[3px]",
                  idx === 0 && activeIndex === idx
                    ? "w-8 h-6 bg-accent-sky text-navy-dark opacity-100 shadow-[0_0_14px_rgba(79,163,217,0.35)]"
                    : idx === 0
                      ? "w-6 h-6 bg-white/10 text-white/60 opacity-75 hover:bg-white/15 hover:text-white/80"
                      : activeIndex === idx
                        ? "w-5 h-[7px] bg-accent-sky opacity-100"
                        : "w-[7px] h-[7px] bg-white/50 opacity-60 hover:bg-white/70",
                )}
              >
                {idx === 0 && <LocationPinIcon />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
