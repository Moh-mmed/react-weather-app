import styled, { keyframes } from "styled-components";
import { breakpoints, theme } from "../../constants";

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`;

const pulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 2px ${theme.sun}); }
  50% { filter: drop-shadow(0 0 9px ${theme.sun}); }
`;

export const DashboardApp = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  padding: 28px clamp(20px, 4vw, 48px);
  gap: 20px;
  color: ${theme.textHi};
  background:
    radial-gradient(1100px 600px at 85% -10%, rgba(79, 163, 217, 0.14), transparent 60%),
    radial-gradient(900px 500px at 10% 110%, rgba(244, 169, 59, 0.1), transparent 60%),
    linear-gradient(180deg, ${theme.bg0}, ${theme.bg1});
  overflow: hidden;
`;

export const DashboardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BrandWord = styled.div`
  font-family: ${theme.fonts.display};
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.2px;

  em {
    font-style: italic;
    color: ${theme.sun};
  }
`;

export const Headline = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: right;

  @media (max-width: ${breakpoints.desktop}) {
    text-align: left;
  }
`;

export const HeadlinePlace = styled.div`
  text-align: left;
`;

export const HeadlineDay = styled.div`
  font-size: 13px;
  color: ${theme.textLo};
  font-family: ${theme.fonts.mono};
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

export const HeadlineLoc = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

export const HeadlineTemp = styled.div`
  font-family: ${theme.fonts.display};
  font-weight: 600;
  font-size: 32px;
  line-height: 1;
  color: ${theme.sky};
`;

export const DashboardMain = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: 2.05fr 1fr;
  gap: 20px;
  min-height: 0;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 1fr;
    overflow-y: auto;
    padding-right: 4px;
  }
`;

export const Column = styled.div`
  display: grid;
  gap: 20px;
  min-height: 0;
`;

export const LeftColumn = styled(Column)`
  grid-template-rows: auto auto auto 1fr;
`;

export const RightColumn = styled(Column)`
  grid-template-rows: auto auto auto;
`;

export const Panel = styled.section`
  background:
    linear-gradient(165deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
    ${theme.panel};
  border: 1px solid ${theme.panelLine};
  border-radius: 22px;
  padding: 22px 24px;
  position: relative;
  overflow: hidden;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${rise} 0.5s ease both;
    animation-delay: ${(props) => props.$delay || "0s"};
  }
`;

export const PanelTitle = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: ${theme.textLo};
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.85;
  }
`;

export const HeroPanel = styled(Panel)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 190px;
`;

export const HeroGlow = styled.div`
  position: absolute;
  top: -40px;
  right: -30px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 169, 59, 0.3), transparent 70%);
  filter: blur(10px);
`;

export const HeroLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1;
`;

export const HeroCondition = styled.div`
  font-family: ${theme.fonts.display};
  font-style: italic;
  font-size: 17px;
  color: ${theme.sky};
  text-transform: capitalize;
`;

export const HeroTemp = styled.div`
  font-family: ${theme.fonts.display};
  font-weight: 600;
  font-size: clamp(64px, 8vw, 96px);
  line-height: 1;
  letter-spacing: -2px;
`;

export const HeroSub = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 8px;

  span {
    font-family: ${theme.fonts.mono};
    font-size: 13px;
    color: ${theme.textLo};
  }

  b {
    color: ${theme.textHi};
    font-weight: 500;
  }
`;

export const HeroIcon = styled.img`
  width: 150px;
  height: 150px;
  opacity: 0.95;
  z-index: 1;
  flex-shrink: 0;
`;

export const HourlyRow = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-top: 14px;
  padding-bottom: 4px;
  scrollbar-width: thin;
`;

export const HourCard = styled.div`
  flex: 0 0 auto;
  width: 74px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-radius: 14px;
  background: ${(props) =>
    props.$active ? "rgba(79,163,217,0.14)" : "transparent"};
  border: 1px solid
    ${(props) =>
      props.$active ? "rgba(79,163,217,0.35)" : "transparent"};
  opacity: ${(props) => (props.$interpolated ? 0.7 : 1)};
`;

export const HourlyEmpty = styled.div`
  display: flex;
  align-items: center;
  min-height: 116px;
  font-size: 12px;
  color: ${theme.textLo};
`;

export const HourLabel = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 11px;
  color: ${(props) => (props.$active ? theme.sky : theme.textLo)};
`;

export const HourValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 14px;
  font-weight: 500;
`;

export const HourIcon = styled.img`
  width: 26px;
  height: 26px;
`;

export const StatsCarouselPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 164px;
  padding: 18px 18px 14px;
`;

export const StatsCarouselViewport = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
  cursor: grab;
  border-radius: 18px;

  &::-webkit-scrollbar {
    display: none;
  }

  &:active {
    cursor: grabbing;
  }
`;

export const StatsCarouselSlide = styled.div`
  flex: 0 0 100%;
  min-width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  box-sizing: border-box;
  height: 100%;
  padding-right: 0;
`;

export const StatsCarouselFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 20px;
`;

export const StatsCarouselDots = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StatsCarouselDot = styled.button`
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: ${(props) => (props.$active ? "#4FA3D9" : "#8CA1B4")};
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
  cursor: pointer;
  transition: transform 160ms ease, opacity 160ms ease, background 160ms ease;

  &:hover {
    transform: scale(1.12);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid rgba(79, 163, 217, 0.7);
    outline-offset: 3px;
  }
`;

export const StatsCarouselNav = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StatsCarouselArrow = styled.button`
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid ${theme.panelLine};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: ${theme.textHi};
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: rgba(79, 163, 217, 0.12);
    border-color: rgba(79, 163, 217, 0.45);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(79, 163, 217, 0.7);
    outline-offset: 3px;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  &:disabled {
    opacity: 0.38;
    cursor: default;
    transform: none;
  }
`;

export const StatTile = styled.div`
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid ${theme.panelLine};
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const StatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.sky};
    opacity: 0.9;
  }
`;

export const StatLabel = styled.span`
  font-size: 12px;
  color: ${theme.textLo};
  text-transform: capitalize;
`;

export const StatValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 22px;
  font-weight: 600;
  margin-top: 10px;

  small {
    font-size: 13px;
    color: ${theme.textLo};
    font-weight: 400;
    margin-left: 2px;
  }
`;

export const ArcWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ArcLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 2px;
`;

export const ArcLabelBlock = styled.div`
  text-align: ${(props) => (props.$align || "left")};
`;

export const ArcLabelKey = styled.div`
  font-size: 11px;
  color: ${theme.textLo};
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

export const ArcLabelValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 14px;
  font-weight: 500;
  margin-top: 2px;
`;

export const UvChip = styled.div`
  margin-top: 14px;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(226, 105, 74, 0.12);
  border: 1px solid rgba(226, 105, 74, 0.3);
  border-radius: 14px;
  padding: 14px 14px 16px;
  box-sizing: border-box;
`;

export const UvNum = styled.div`
  font-family: ${theme.fonts.display};
  font-weight: 600;
  font-size: 24px;
  color: ${theme.coral};
`;

export const UvDesc = styled.div`
  font-size: 12px;
  color: ${theme.textLo};
  line-height: 1.55;

  b {
    color: ${theme.textHi};
    text-transform: capitalize;
  }
`;

export const AqiTop = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 6px;
`;

export const AqiNum = styled.div`
  font-family: ${theme.fonts.display};
  font-weight: 600;
  font-size: 40px;
`;

export const AqiTag = styled.div`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(244, 169, 59, 0.18);
  color: ${theme.sun};
`;

export const AqiPollutant = styled.div`
  font-size: 12px;
  color: ${theme.textLo};
  margin-top: 2px;
`;

export const Gauge = styled.div`
  margin-top: 16px;
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    ${theme.good},
    #f4d93b,
    ${theme.sun},
    ${theme.coral},
    #a85fd9
  );
`;

export const GaugeMarker = styled.div`
  position: absolute;
  top: -4px;
  left: ${(props) => props.$left}%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${theme.bg1};
  border: 3px solid #f4d93b;
  transform: translateX(-50%);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.25);
`;

export const GaugeScale = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;

  span {
    font-size: 10px;
    color: ${theme.textLo};
  }
`;

export const ForecastPanel = styled(Panel)`
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const ForecastDay = styled.div`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
`;

export const ForecastCond = styled.div`
  font-size: 12px;
  color: ${theme.textLo};
  text-transform: capitalize;
`;

export const ForecastGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(${({ $columns = 7 }) => $columns}, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  min-height: 0;
  align-items: stretch;
  justify-content: stretch;
`;

export const ForecastCard = styled.div`
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid ${theme.panelLine};
  border-radius: 18px;
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 204px;
  min-width: 0;
  width: 100%;
  max-width: none;
  flex: none;
  box-sizing: border-box;
  align-self: stretch;
`;

export const ForecastCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const ForecastIcon = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

export const ForecastTempRow = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 16px;
  font-weight: 600;

  .lo {
    color: ${theme.textLo};
    font-weight: 400;
  }
`;

export const ForecastMeta = styled.div`
  display: grid;
  gap: 5px;
  margin-top: auto;
`;

export const ForecastMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  color: ${theme.textLo};

  b {
    color: ${theme.textHi};
    font-family: ${theme.fonts.mono};
    font-weight: 500;
  }
`;

export const SunDot = styled.circle`
  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 2.6s ease-in-out infinite;
  }
`;
