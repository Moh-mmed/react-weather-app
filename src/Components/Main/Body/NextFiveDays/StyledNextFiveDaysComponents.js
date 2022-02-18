import styled from "styled-components";
import img from "../../../../imgs/rainy_tomorrow.jpg";
const season = {
  winter: 'winter',
  spring: 'spring',
  summer: 'summer',
  fall: 'fall'
}
function tempRange(temp) {
  const { winter, spring, summer, fall } = season
  let currSeason = winter
  switch (currSeason) {
    case "winter":
      return temp / (10/47) + 33; // between 0 and 10
    case "spring":
      return (temp - 8) / (7/47) + 33; // between 8 and 15
    case "summer":
      return (temp - 20) / (25/47) + 33; // between 20 and 45
    case "fall":
      return (temp - 5) / (15/47) + 33; // between 5 and 20
    default:
      return temp / (45/47) + 33; // between 0 and 45
  }
}

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

export const StyledDailyTemp = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
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
  background-color: #00afef7a;
  border-radius: 50%;
`;
export const StyledBulletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 60%;
  max-height: 70%;
  min-height: 33%;
  width: 100%;
`;
export const StyledBullet = styled.div`
  width: 7px;
  height: 7px;
  background-color: #29364c;
  border-radius: 50%;
  margin-top: 10px;
`;
export const StyledDailyDegree = styled.div`
  height: 25%;
  width: 100%;
  margin-top: 10%;
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
    font-size: 0.7rem;
    color: #6a6a6a;
  }
`;

