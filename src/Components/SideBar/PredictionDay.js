import React from 'react'
import moment from "moment"
import { Day} from "./StyledSidebarComponents";
const PredictionDay = (props) => {
  console.log(props.data)
   const { timezone_offset } = props.timezoneOffset;
    const { feels_like, temp, weather, dt } = props.data
    const temperature = Math.ceil(temp.day)
    const feelsLike = Math.ceil(feels_like.day)
    const {icon, main,description} = weather[0]
    const imgSrc = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const date = moment
      .unix(dt)
      .utcOffset(timezone_offset / 3600)
      .format("MMMM DD");
    return (
      <Day>
        <img src={imgSrc} alt={description} style={{ width: "45px" }} />
        <div>
          <div>{date}</div>
          <div>
            <span>{main}</span>
            <div>
              <span>{temperature}°</span>
              <span>/</span>
              <span>{feelsLike}°</span>
            </div>
          </div>
        </div>
      </Day>
    );
}

export default PredictionDay