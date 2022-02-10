import {Outlet } from "react-router-dom";
import Weather from "./Weather";
import AirQuality from "./AirQuality";
import { StyledBodyContainer } from "./StyledBodyContainer";

const Body = () => {
  return (
    <StyledBodyContainer>
      <Weather />
      <AirQuality />
      <Outlet />
    </StyledBodyContainer>
  );
};

export default Body;
