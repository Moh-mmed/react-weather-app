import moment from "moment";
const getTiming = (sunrise, sunset, time, timezone) => {
  const hasValidInput =
    Number.isFinite(sunrise) &&
    Number.isFinite(sunset) &&
    Number.isFinite(time) &&
    Number.isFinite(timezone);

  if (!hasValidInput) {
    return {
      day: false,
      width: 0,
      today: "--",
      Sunrise: "--",
      Sunset: "--",
      clock: "--",
    };
  }

  let today = moment.unix(time).utcOffset(timezone / 3600).format("ddd DD MMM");
  let Sunrise = moment.unix(sunrise)
    .utcOffset(timezone / 3600)
    .format("hh:mm A");
  let Sunset = moment.unix(sunset)
    .utcOffset(timezone / 3600)
    .format("hh:mm A");
  let clock = moment.unix(time)
    .utcOffset(timezone / 3600)
    .format("hh:mm A");
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