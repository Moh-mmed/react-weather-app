import styled from "styled-components";
import { colors } from "../../../../constants";
export const StyledWeatherContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-transform: capitalize;
  background: ${(props) => `url(${props.img})`};
  background-size: cover;
  border-radius: 20px;
  box-shadow: 4px 4px 8px 5px rgb(41 54 76 / 13%);
  min-height: 280px;
  min-width: 390px;
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
`;

export const StyledImg = styled.img`
  width: 50px;
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
  font-weight: 600;
  font-size: 0.75rem;
  color: ${colors.FontBlack};
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
    background-color: ${colors.FontDarkBlue};
    color: #fff;
  }
  & > div:nth-child(2) {
    background-color: ${colors.lightGreen};
    color: ${colors.FontBlack};
  }
  & > div:nth-child(3) {
    background-color: #fff;
    border-radius: 20px;
    color: ${colors.FontBlack};
  }
`;