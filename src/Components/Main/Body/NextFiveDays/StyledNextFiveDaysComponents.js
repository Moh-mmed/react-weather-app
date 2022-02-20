import styled from "styled-components";
import {colors} from "../../../../constants"
export const StyledTodaysWeather = styled.div`
  grid-column-start: 1;
  grid-column-end: 3;
  padding: 1rem;
`;

export const StyledTempHeading = styled.div`
  grid-column-start: 1;
  grid-column-end: 3;
  display: flex;
  align-items: center;
  height: 20%;
`; 
export const StyledHeading = styled.span`
  line-height: 30px;
  font-size: 1.5rem;
  font-weight: 600;
`; 

export const StyledTemperatures = styled.div`
  height: 80%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 2%;
`; 


// DayTemp Styling 
export const StyledDailyTemp = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  &:not(:last-child)::after {
    position: absolute;
    content: "";
    right: 0;
    width: 1px;
    height: 80%;
    border-radius: 10px;
    transform: translateY(-5%);
    background-color: rgb(223 223 223 / 50%);
  }
`;
export const StyledDailyIcon = styled.img`
  width: 60px;
  background-color: ${colors.lightMainColor};
  border-radius: 50%;
`;

export const StyledDailyDegree = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  & > span:nth-child(1) {
    font-size: 1.2rem;
    font-weight: 600;
    transform: translateX(5px);
  }
  & > span:nth-child(2) {
    text-transform: capitalize;
    font-size: 0.8rem;
    margin: 1rem 0;
    color: ${colors.FirstDarkGray};
  }
`;

