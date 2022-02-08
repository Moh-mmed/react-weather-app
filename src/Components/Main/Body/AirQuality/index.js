import React from "react";
import img from "../../../../imgs/wind.png"
import {
  StyledAirQualityContainer,
  StyledHeading,
  StyledImgContainer,
  StyledImg,
  StyledDesc,
  StyledDegree,
  StyledCondition,
  StyledStats,
  StyledLevel,
  StyledLevelSpan,
<<<<<<< HEAD
  StyledLevelBar,
=======
  StyledProgressBarContainer,
  StyledProgressBar,
>>>>>>> 43d0e9c (finishing main design)
} from "./StyledAirQualityComponents";

const AirQuality = () => {
  return (
    <StyledAirQualityContainer>
      <StyledHeading>
        <StyledImgContainer>
<<<<<<< HEAD
          <StyledImg src={img} alt="wind img"/>
=======
          <StyledImg src={img} alt="wind img" />
>>>>>>> 43d0e9c (finishing main design)
        </StyledImgContainer>
        <StyledDesc>
          <span>air quality</span>
          <span>main pollution: PM 2.5</span>
        </StyledDesc>
      </StyledHeading>
      <div>
        <StyledDegree>
          <span>390</span>
          <span>aqi</span>
        </StyledDegree>
        <StyledCondition>west wind</StyledCondition>
      </div>
      <StyledStats>
        <StyledLevel>
          <StyledLevelSpan variant={false}>good</StyledLevelSpan>
          <StyledLevelSpan variant={true}>standard</StyledLevelSpan>
          <StyledLevelSpan variant={false}>hazardous</StyledLevelSpan>
        </StyledLevel>
<<<<<<< HEAD
        <StyledLevelBar/>
=======
        <StyledProgressBarContainer>
          <StyledProgressBar variant="45.8"/>
        </StyledProgressBarContainer>
>>>>>>> 43d0e9c (finishing main design)
      </StyledStats>
    </StyledAirQualityContainer>
  );
};

export default AirQuality;
