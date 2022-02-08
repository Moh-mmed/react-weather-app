import styled from "styled-components";
import img from "../../imgs/sunny-icon.png";
export const StyledSideBar = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #fbf9f9;
  padding: 0 2em;
`;

export const StyledTodaysInfo = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  &::after {
    content: "";
    bottom: -5px;
    left: 50%;
    position: absolute;
    width: calc(100% - 4em);
    height: 2px;
    background-color: #f5f5f5;
    transform: translateX(-50%);
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



export const StyledSunContainer = styled.div`
  min-height: 70%;
  margin-top: 16px;
`;
export const StyledSunPath = styled.div`
  height: 140px;
  border-bottom: 2px solid #00afef;
  position: relative;
  overflow: hidden;
`;
export const StyledPath = styled.div`
  position: absolute;
  top: 35px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: dashed 2px #00afef;
  text-align: center;
`;
export const StyledSunIcon = styled.div`
  background-color: bisque;
  width: 50%;
  box-sizing: border-box;
  top: 50%;
  left: 0%;
  position: absolute;
  transform-origin: right;
  transform: rotate(90deg);
  &::after {
    content: "";
    position: absolute;
    left: -35px;
    top: -8px;
    width: 25px;
    height: 25px;
    background: url(${img});
    background-size: cover;
  }
`;

export const StyledNodePoint = styled.span`
  width: 7px;
  height: 7px;
  color: #29364c;
`;
export const StyledMovingNode = styled.div`
  width: 7px;
  height: 7px;
  color: #00afef;
`;
export const StyledSunInfo = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  padding: 0 1.2rem;
  & > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
    text-transform: capitalize;

    & > span:nth-child(1) {
      font-size: 0.8rem;
      font-weight: 700;
    }
    & > span:nth-child(2) {
      font-size: 0.9rem;
      font-weight: 400;
      letter-spacing: 1px;
    }
  }
`;