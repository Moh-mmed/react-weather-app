import { useEffect, useRef, useState } from "react";
import { getDewPoint } from "../../helpers/getDewPoint";
import { getWindDirectionAbbr } from "../../helpers/getWindDirection";
import {
  StatsCarouselDot,
  StatsCarouselDots,
  StatsCarouselFooter,
  StatsCarouselPanel,
  StatsCarouselSlide,
  StatsCarouselViewport,
  StatTile,
  StatTop,
  StatLabel,
  StatValue,
} from "./StyledDashboard";

const StatIcon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {children}
  </svg>
);

const StatsGrid = ({ weatherData }) => {
  const trackRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const scrollRafRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { current } = weatherData;
  const {
    pressure,
    humidity,
    wind_speed,
    wind_deg,
    visibility,
    temp,
    clouds,
  } = current;

  const dewPoint = getDewPoint(temp, humidity);
  const windKmh = Number.isFinite(wind_speed)
    ? Math.round(wind_speed * 3.6)
    : "--";
  const windDir = getWindDirectionAbbr(wind_deg);
  const visibilityKm = Number.isFinite(visibility)
    ? (visibility / 1000).toFixed(1)
    : "--";

  const stats = [
    {
      label: "Pressure",
      value: Number.isFinite(pressure) ? pressure : "--",
      unit: "hPa",
      icon: (
        <>
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M12 16l4-5" />
          <path d="M7 16h10" />
          <circle cx="12" cy="16" r="1" />
        </>
      ),
    },
    {
      label: "Humidity",
      value: Number.isFinite(humidity) ? humidity : "--",
      unit: "%",
      icon: <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" />,
    },
    {
      label: "Wind",
      value: windKmh,
      unit: `km/h ${windDir}`,
      icon: (
        <>
          <path d="M3 8h11a3 3 0 1 0-3-3" />
          <path d="M3 16h14a3 3 0 1 1-3 3" />
        </>
      ),
    },
    {
      label: "Visibility",
      value: visibilityKm,
      unit: "km",
      icon: (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ),
    },
    {
      label: "Dew Point",
      value: Number.isFinite(dewPoint) ? dewPoint : "--",
      unit: "°C",
      icon: (
        <>
          <path d="M12 2v6M9 5l3 3 3-3" />
          <circle cx="12" cy="15" r="6" />
        </>
      ),
    },
    {
      label: "Cloud Cover",
      value: Number.isFinite(clouds) ? clouds : "--",
      unit: "%",
      icon: (
        <path d="M6 17a4 4 0 1 1 1-7.9 5 5 0 0 1 9.6 1.9A3.5 3.5 0 0 1 16 17H6z" />
      ),
    },
  ];

  const scrollToIndex = (index, behavior = "smooth") => {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex = Math.max(0, Math.min(index, stats.length - 1));
    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior,
    });
    setActiveIndex(nextIndex);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    window.cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = window.requestAnimationFrame(() => {
      const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
      setActiveIndex(Math.max(0, Math.min(nextIndex, stats.length - 1)));
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    setIsDragging(true);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: track.scrollLeft,
    };
  };

  const handleMouseMove = (e) => {
    const { active, startX, startScrollLeft } = dragStateRef.current;
    if (!active) return;

    const track = trackRef.current;
    if (!track) return;

    e.preventDefault();
    const x = e.clientX;
    const walk = x - startX;
    track.scrollLeft = startScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (dragStateRef.current.active) {
      dragStateRef.current.active = false;
      setIsDragging(false);
    }
  };

  useEffect(
    () => () => {
      window.cancelAnimationFrame(scrollRafRef.current);
    },
    []
  );

  return (
    <StatsCarouselPanel $delay="0.15s">
      <StatsCarouselViewport
        ref={trackRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        $isDragging={isDragging}
        aria-label="Weather statistics carousel"
      >
        {stats.map((stat) => (
          <StatsCarouselSlide key={stat.label}>
            <StatTile>
              <StatTop>
                <StatLabel>{stat.label}</StatLabel>
                <StatIcon>{stat.icon}</StatIcon>
              </StatTop>
              <StatValue>
                {stat.value}
                <small>{stat.unit}</small>
              </StatValue>
            </StatTile>
          </StatsCarouselSlide>
        ))}
      </StatsCarouselViewport>

      <StatsCarouselFooter>
        <StatsCarouselDots role="group" aria-label="Weather statistics positions">
          {stats.map((stat, index) => (
            <StatsCarouselDot
              key={stat.label}
              type="button"
              aria-label={`Show ${stat.label}`}
              aria-pressed={activeIndex === index}
              $active={activeIndex === index}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </StatsCarouselDots>
      </StatsCarouselFooter>
    </StatsCarouselPanel>
  );
};

export default StatsGrid;
