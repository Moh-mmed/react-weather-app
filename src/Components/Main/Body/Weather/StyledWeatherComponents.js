import styled from "styled-components";
import img from "../../../../imgs/day-partly-cloudy.jpg";
export const StyledWeatherContainer = styled.div`
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
    background-color: #fff;
    padding: 2px 5px;
    border-radius: 7px;
  }
`;
export const StyledCondition = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
`;

export const StyledStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 70px;
  grid-column-gap: 10px;
  & > div {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 20px;
    width: 90px;
    padding: 8px 5px;
    & > span:nth-child(1) {
      font-size: 0.6rem;
      font-weight: 500;
    }
    & > span:nth-child(2) {
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
  & > div:nth-child(1) {
    background-color: #29364c;
    color: #fff;
  }
  & > div:nth-child(2) {
    background-color: #cce16a;
  }
  & > div:nth-child(3) {
    background-color: #fff;
    border-radius: 20px;
  }
`;