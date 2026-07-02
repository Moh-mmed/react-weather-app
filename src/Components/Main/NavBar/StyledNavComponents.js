import styled, { keyframes} from "styled-components";
import { colors, breakpoints } from "../../../constants";

export const NavContainer = styled.div`
  display: flex;
  align-items: center;
  max-height: 80px;

  @media (max-width: ${breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem 0;
    max-height: none;
  }
`;

export const StyledLogo = styled.div`
  display: flex;
  width: 50%;

  @media (max-width: ${breakpoints.tablet}) {
    width: 100%;
    justify-content: center;
  }
`
export const StyledImage = styled.img`
  width: 115px;
`;

export const StyledSearchbar = styled.div`
  position: relative;
  display: flex;
  justify-content: end;
  width: 50%;

  & > form {
    width: 100%;
  }

  @media (max-width: ${breakpoints.tablet}) {
    width: 100%;
    justify-content: stretch;
  }
`;
export const StyledInput = styled.input`
  position: relative;
  min-width: 300px;
  width: 100%;
  padding: 1em 0.9em;

  @media (max-width: ${breakpoints.tablet}) {
    min-width: 0;
  }
  background-color: #ebeff0;
  border-radius: 10px;
  font-size: 0.95em;
  font-weight: 500;
  color: ${colors.FirstDarkGray};
  outline: none;
  border: none;
  &::placeholder {
    color: #7e7e7e;
  }
`;
export const StyledSearchImgContainer = styled.div`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  pointer-events: none;
`;
export const StyledImg = styled.img`
  width: 21px
`;
const displayTooltip = keyframes`
0%{opacity: 0}
20%{opacity: 1}
80%{opacity: 1}
100%{opacity: 0}
`;
export const StyledTooltip = styled.div`
  position: absolute;
  opacity: 0;
  top: 58px;
  left: 33%;
  background-color: #ff5346de;
  border-radius: 15px;
  padding: 15px 13px;
  font-size: 0.7rem;
  color: #fff;
  animation: ${displayTooltip} 3s ease-in;
  &::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 15px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #ff5346de;
  }
`;

