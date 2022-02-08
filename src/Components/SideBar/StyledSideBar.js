import styled from "styled-components";

export const StyledSideBar = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #fbf9f9;
`;

export const StyledTodaysInfo = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 0 2em;
  &::after {
    content: "";
    bottom: -5px;
    position: absolute;
    width: calc(100% - 4em);
    height: 2px;
    background-color: #f5f5f5;
  }
`;
export const StyledDate = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 50px;
  & > span:nth-child(1) {
    font-size: 1.2rem;
    font-weight: 600;
  }
  & > span:nth-child(2) {
    font-size: 0.8rem;
    font-weight: 400;
  }
`;
export const StyledTemp = styled.div`
  font-size: 2.3rem;
  font-weight: 500;
  color: #00afef;
`;
