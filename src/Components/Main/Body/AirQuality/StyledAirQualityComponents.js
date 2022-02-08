import styled from "styled-components";
<<<<<<< HEAD
import img from "../../../../imgs/day-partly-cloudy.jpg";
=======
import img from "../../../../imgs/clean-air.jpg";

>>>>>>> 43d0e9c (finishing main design)
export const StyledAirQualityContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
<<<<<<< HEAD
  color: #6a6a6a;
=======
>>>>>>> 43d0e9c (finishing main design)
  text-transform: capitalize;
  background: url(${img});
  background-size: cover;
  border-radius: 20px;
<<<<<<< HEAD
  min-height: 280px;
  padding: 20px 30px;
=======
  box-shadow: 4px 4px 8px 5px rgb(41 54 76 / 13%);
  min-height: 280px;
  min-width: 390px;
  padding: 20px 30px;
  color: #fff;
>>>>>>> 43d0e9c (finishing main design)
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
<<<<<<< HEAD
  color: #29364c;
=======
>>>>>>> 43d0e9c (finishing main design)
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
<<<<<<< HEAD
=======
    color: #13150a;
>>>>>>> 43d0e9c (finishing main design)
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
<<<<<<< HEAD
  color: ${(props) => (props.variant ? "#fff" : "#464646")};
  padding: 7px;
  background-color: ${(props) => (props.variant ? "#29364c" : "none")};
  border-radius: 8px;
=======
  color: ${(props) => (props.variant ? "#fff" : "#29364C")};
  padding: 7px;
  background-color: ${(props) => (props.variant ? "#29364c" : "none")};
  border-radius: 8px;
  box-shadow: ${(props) =>
    props.variant ? "3px 3px 4px 1px rgb(41 54 76 / 13%)" : "none"};
>>>>>>> 43d0e9c (finishing main design)
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
<<<<<<< HEAD
export const StyledLevelBar = styled.div`
  background-color: #00afef;
  border-radius: 20px;
  height: 5px;
`;

=======

export const StyledProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: #ebebeb;
  border-radius: 20px;
  overflow: hidden;
`;
export const StyledProgressBar = styled.div`
  background-image: -webkit-linear-gradient(
      135deg,
      transparent,
      transparent 33%,
      rgba(0, 0, 0, 0.1) 33%,
      rgba(0, 0, 0, 0.1) 66%,
      transparent 66%
    ),
    -webkit-linear-gradient(top, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.2)),
    -webkit-linear-gradient(left, #00afef, #00afef);

  background-size: 20px 10px, 100% 100%, 100% 100%;
  width: ${(props) => `${props.variant}%`};
  height: 100%;
`;
>>>>>>> 43d0e9c (finishing main design)
