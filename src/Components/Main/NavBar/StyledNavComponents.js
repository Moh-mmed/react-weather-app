import styled, { keyframes } from "styled-components";
import { theme } from "../../../constants";

const displayTooltip = keyframes`
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
`;

export const StyledSearchbar = styled.div`
  flex: 1;
  max-width: 420px;
  min-width: 180px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.panelLine};
  border-radius: 999px;
  padding: 11px 18px;
  color: ${theme.textLo};
  font-size: 14px;

  & > form {
    flex: 1;
    display: flex;
  }

  @media (max-width: 768px) {
    max-width: none;
    width: 100%;
    min-width: 0;
  }
`;

export const StyledInput = styled.input`
  all: unset;
  flex: 1;
  color: ${theme.textHi};
  font-size: 14px;
  font-family: ${theme.fonts.body};
  width: 100%;

  &::placeholder {
    color: ${theme.textLo};
  }
`;

export const StyledSearchImgContainer = styled.div`
  display: flex;
  align-items: center;
  opacity: 0.7;
  flex-shrink: 0;
  pointer-events: none;
`;

export const StyledImg = styled.img`
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(0.75);
`;

export const StyledTooltip = styled.div`
  position: absolute;
  opacity: 0;
  top: calc(100% + 8px);
  left: 10%;
  background-color: rgba(226, 105, 74, 0.92);
  border-radius: 15px;
  padding: 12px 13px;
  font-size: 0.7rem;
  color: #fff;
  animation: ${displayTooltip} 3s ease-in;
  z-index: 2;

  &::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 15px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid rgba(226, 105, 74, 0.92);
  }
`;

export const StyledDropdown = styled.ul`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${theme.panel};
  border: 1px solid ${theme.panelLine};
  border-radius: 12px;
  list-style: none;
  padding: 8px 0;
  margin: 0;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  max-height: 250px;
  overflow-y: auto;
`;

export const StyledDropdownItem = styled.li`
  padding: 10px 18px;
  cursor: pointer;
  color: ${theme.textHi};
  font-family: ${theme.fonts.body};
  display: flex;
  flex-direction: column;
  background: ${props => props.highlighted ? "rgba(255, 255, 255, 0.05)" : "transparent"};
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const StyledDropdownText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

export const StyledDropdownSubtext = styled.span`
  font-size: 12px;
  color: ${theme.textLo};
  margin-top: 2px;
`;

export const StyledNoMatches = styled.div`
  padding: 12px 18px;
  color: ${theme.textLo};
  font-family: ${theme.fonts.body};
  font-size: 14px;
  text-align: center;
`;
