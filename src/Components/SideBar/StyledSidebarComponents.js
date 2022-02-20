import styled from "styled-components";
import {colors} from "../../constants"
import img from "../../imgs/sun.png";

const degreeCalc = (deg) => {
  if(deg <= 3 || deg >= 97) return deg*1.8
  deg = deg * 1.8;
  let diff = 26 - (deg * 0.28)
  return deg+diff
}

export const StyledSideBar = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 350px;
  background-color: ${colors.firstLightGray};
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
  width: 60%;
  font-size: 0.8rem;
  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    & > span:nth-child(1) {
      font-size: 1.2rem;
      font-weight: 600;
    }
  }
`;
export const StyledTemp = styled.div`
  font-size: 2.3rem;
  font-weight: 500;
  color: ${colors.mainColor};
`;



export const StyledSunContainer = styled.div`
  height: 196px;
  margin-top: 16px;
  position: relative;
`;
export const StyledSunPath = styled.div`
  height: 140px;
  border-bottom: 2px solid ${colors.mainColor};
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
  border: dashed 2px
    ${(props) => (props.day ? colors.mainColor : colors.FontDarkBlue)};
  text-align: center;
  overflow: hidden;
`;
export const StyledPathColoring = styled.div`
  background-color: ${(props) =>
    props.day ? "rgb(0 187 255 / 7%)" : "none"};
  width: ${(props) => `${props.width}%`};
  height: 100%;
  top: 0;
  border: none;
`;
export const StyledSunIcon = styled.div`
  width: 50%;
  box-sizing: border-box;
  bottom: -8px;
  position: absolute;
  transform-origin: right;
  transform: ${(props) => `rotate(${degreeCalc(props.width)}deg)`};
  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: -10px;
    width: 25px;
    height: 25px;
    background: url(${img});
    background-size: cover;
  }
`;

export const StyledStartNode = styled.span`
  display: inline-block;
  position: absolute;
  top: 134px;
  left: 21px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => (props.day ? colors.mainColor : colors.FontDarkBlue)};
`;
export const StyledMovingNode = styled(StyledStartNode)`
  display: ${(props) => (props.day ? "inline-block" : "none")};
  left: ${(props) => `${21 + props.width * 2.35}px`};
  background-color: ${colors.mainColor};
`;
export const StyledEndNode = styled(StyledStartNode)`
  left: 256px;
  background-color: ${colors.FontDarkBlue};
`;
export const StyledSunInfo = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  & > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    min-height: 30px;
    text-transform: capitalize;

    & > span:nth-child(1) {
      font-size: 0.62rem;
      font-weight: 700;
    }
    & > span:nth-child(2) {
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 1px;
      color: ${colors.FirstDarkGray};
    }
  }
`;

export const StyledUIrays = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  height: 75px;
  width: 100%;
  padding: 20px;
  background-color: ${colors.FontDarkBlue};
  color: #fff;
  border-radius: 15px;
  & > div:nth-child(2) {
    width: 75%;
    text-transform: capitalize;
    & > div:nth-child(1) {
      display: flex;
      align-items: center;
      & > span:nth-child(1) {
        text-transform: uppercase;
        font-size: 1.3rem;
        font-weight: 500;
        margin-right: 20px;
        letter-spacing: 1px;
      }
      & > span:nth-child(2) {
        display: inline-block;
        font-size: 0.5rem;
        padding: 3px 4px;
        background-color: ${colors.lightGreen};
        border-radius: 15px;
        color: ${colors.FontBlack};
      }
    }
    & > div:nth-child(2) {
      font-size: 0.7rem;
      font-weight: 400;
      margin-top: 5px;
    }
  }
`;

export const StyledPredictionHeading = styled.div`
  line-height: 30px;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 20px;
`;
export const StyledFollowingDays = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;
export const Day = styled.div`
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 16px 20px;
  border-radius: 15px;
  & > div:nth-child(2) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 75%;
    height: 40px;
    text-transform: capitalize;
    & > div:nth-child(1) {
      font-size: 0.7rem;
      font-weight: 400;
      color: ${colors.FirstDarkGray};
    }
    & > div:nth-child(2) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${colors.FontBlack};
      text-transform: capitalize;
      font-size: 0.9rem;
      font-weight: 700;
      & > div {
        display: flex;
        justify-content: space-between;
        width: 65px;
        font-size: 0.9rem;
        font-weight: 600;
        color: ${colors.mainColor};
      }
    }
  }
`;
export const StyledFollowingFiveDays = styled.div`
  display: flex;
  justify-content: flex-end;
  height: 60px;
  padding: 15px 0 0;
`;
export const StyledButton = styled.div`
  background-color: ${(props) =>
    props.variant ? colors.FontDarkBlue : colors.mainColor};
  display: flex;
  align-items: center;
  border-radius: 15px;
  padding: 14px 18px;
  color: #fff;
  cursor: pointer;
  & > span {
    font-size: 0.7rem;
    font-weight: 400;
    margin-left: 10px;
    text-transform: capitalize;
  }
`;
export const StyledCalendarIcon = styled.img`
  width: 15px;
`;