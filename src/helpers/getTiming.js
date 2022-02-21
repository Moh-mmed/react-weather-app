import moment from "moment";
const getTiming = (sunrise, sunset, time, timezone) => {
  let today = moment.unix(time).utcOffset(timezone / 3600).format("ddd DD MMM");
  let Sunrise = moment(sunrise * 1000)
    .utcOffset(timezone / 3600)
    .format("LT");
  let Sunset = moment(sunset * 1000)
    .utcOffset(timezone / 3600)
    .format("LT");
  let clock = moment(time * 1000)
    .utcOffset(timezone / 3600)
    .format("LT");
  if (time >= sunrise && time < sunset) {
    let day = true;
    let dayDuration = (sunset - sunrise) / 60;
    let timeElapsed = (time - sunrise) / 60;
    let widthUnit = 100 / dayDuration;
    let width = widthUnit * timeElapsed;

    return { day, width, today, Sunrise, Sunset, clock };
  }
  return { day: false, width: 0, today, Sunrise, Sunset, clock };
};
export default getTiming