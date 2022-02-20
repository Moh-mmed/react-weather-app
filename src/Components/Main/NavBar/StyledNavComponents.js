import styled, { keyframes} from "styled-components";

export const NavContainer = styled.div`
  display: flex;
  align-items: center;
  max-height: 80px;
`;

export const StyledLogo = styled.div`
display: flex;
width: 50%;
`
export const StyledImage = styled.img`
  width: 115px;
`;

export const StyledSearchbar = styled.div`
position: relative;
  display: flex;
  justify-content: end;
  position: relative;
  width: 50%;
`;
export const StyledInput = styled.input`
  position: relative;
  min-width: 300px;
  padding: 1em 0.9em;
  background-color: #ebeff0;
  border-radius: 10px;
  font-size: 0.95em;
  font-weight: 500;
  color: #6a6a6a;
  outline: none;
  border: none;
  &::placeholder {
    color: #7e7e7e;
  }
`;
export const StyledSearchImgContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 10px;
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

