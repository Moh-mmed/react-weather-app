import styled from "styled-components";

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


