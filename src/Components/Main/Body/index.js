import React from 'react';
import Weather from "./Weather";
import AirQuality from "./AirQuality";
import TodaysTemperatures from "./TodaysTemperatures";
import NextFiveDays from "./NextFiveDays";
import { StyledBodyContainer } from './StyledBodyContainer';

const Body = () => {
  return (
      <StyledBodyContainer>
        <Weather />
        <AirQuality />
      <TodaysTemperatures />
      {/* <NextFiveDays/> */}
      </StyledBodyContainer>
  );
};

export default Body;
