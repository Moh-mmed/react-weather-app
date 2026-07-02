import moment from "moment";
import { formatTime24 } from "./timeFormat";
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
  let Sunrise = formatTime24(sunrise, timezone);
  let Sunset = formatTime24(sunset, timezone);
  let clock = formatTime24(time, timezone);
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
