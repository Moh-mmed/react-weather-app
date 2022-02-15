import React from 'react';
import {
  StyledTemperatures,
  StyledTempHeading,
  StyledHeading,
  StyledTempTomorrow,
  StyledTodaysWeather,
  StyledDailyTemp,
  StyledImgContainer,
  StyledDailyIcon,
  StyledBulletContainer,
  StyledBullet,
  StyledDailyDegree,
} from "./StyledNextFiveDaysComponents";
import cloudy from "../../../../imgs/all-cloudy.png";
import partlyCloudy from "../../../../imgs/partly_cloudy_tomorrow.jpg";
import snowy from "../../../../imgs/snowy_tomorrow.jpg";
import sunny from "../../../../imgs/sun.png";
const NextFiveDays = () => {
  return (
    <StyledTodaysWeather>
      <StyledTempHeading>
        <StyledHeading>
          Next Five <br />
          days' temperature
        </StyledHeading>
      </StyledTempHeading>
      <StyledTempTomorrow>
        <div>Tomorrow</div>
        <div>
          <span>20°c</span>
          <span>rainy</span>
        </div>
      </StyledTempTomorrow>
      <StyledTemperatures>
        <StyledDailyTemp>
          <StyledBulletContainer variant={0}>
            <StyledImgContainer>
              <StyledDailyIcon src={cloudy} alt="cloudy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>0°</span>
            <span>morning</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
        <StyledDailyTemp>
          <StyledBulletContainer variant={10}>
            <StyledImgContainer>
              <StyledDailyIcon src={snowy} alt="snowy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>10°</span>
            <span>afternoon</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
        <StyledDailyTemp>
          <StyledBulletContainer variant={3}>
            <StyledImgContainer>
              <StyledDailyIcon src={partlyCloudy} alt="partly cloudy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>3°</span>
            <span>evening</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
        <StyledDailyTemp>
          <StyledBulletContainer variant={-1}>
            <StyledImgContainer>
              <StyledDailyIcon src={sunny} alt="cloudy" />
            </StyledImgContainer>
            <StyledBullet />
          </StyledBulletContainer>
          <StyledDailyDegree>
            <span>-1°</span>
            <span>night</span>
          </StyledDailyDegree>
        </StyledDailyTemp>
      </StyledTemperatures>
    </StyledTodaysWeather>
  );
};

export default NextFiveDays;
