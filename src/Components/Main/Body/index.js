import React from 'react';
import Weather from "./Weather";
import AirQuality from "./AirQuality";
import TodaysTemperatures from "./TodaysTemperatures";
import { StyledBodyContainer } from './StyledBodyContainer';

const Body = () => {
  return (
      <StyledBodyContainer>
        <Weather />
        <AirQuality />
        <TodaysTemperatures />
      </StyledBodyContainer>
  );
};

export default Body;
