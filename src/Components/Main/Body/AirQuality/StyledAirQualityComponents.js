import styled from "styled-components";
import img from "../../../../imgs/day-partly-cloudy.jpg";
export const StyledAirQualityContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #6a6a6a;
  text-transform: capitalize;
  background: url(${img});
  background-size: cover;
  border-radius: 20px;
  min-height: 280px;
  padding: 20px 30px;
`;
export const StyledHeading = styled.div`
  display: flex;
  align-items: center;
  height: 70px;
`;
export const StyledImgContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  margin-right: 15px;
  border-radius: 50%;
  padding: 8px;
`;

export const StyledImg = styled.img`
  width: 25px;
`;

export const StyledDesc = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 60%;
  & > span:nth-child(1) {
    font-size: 1rem;
    font-weight: 700;
  }
  & > span:nth-child(2) {
    font-size: 0.77rem;
    font-weight: 500;
  }
`;
export const StyledDegree = styled.div`
  display: flex;
  align-items: center;
  color: #29364c;
  & > span:nth-child(1) {
    font-size: 2.1rem;
    font-weight: 700;
    margin-right: 0.8rem;
  }
  & > span:nth-child(2) {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.7rem;
    background-color: #cce16a;
    padding: 2px 5px;
    border-radius: 7px;
  }
`;
export const StyledCondition = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
`;

export const StyledStats = styled.div`
position: relative;
display: flex;
flex-direction: column;
justify-content: space-between;
background-color: #fff;
  border-radius: 20px;
  width: 100%;
  height: 70px;
  padding: 14px 20px
`;

export const StyledLevel = styled.div`
  display: flex;
  justify-content: space-between;
`;
export const StyledLevelSpan = styled.span`
  position: relative;
  font-size: 0.6rem;
  color: ${(props) => (props.variant ? "#fff" : "#464646")};
  padding: 7px;
  background-color: ${(props) => (props.variant ? "#29364c" : "none")};
  border-radius: 8px;
  z-index: 1;
  &::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${(props) => (props.variant ? "#29364c" : "none")};
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
  }
`;
export const StyledLevelBar = styled.div`
  background-color: #00afef;
  border-radius: 20px;
  height: 5px;
`;

