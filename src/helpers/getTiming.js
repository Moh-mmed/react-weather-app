import moment from "moment";
import { formatTime } from "./timeFormat";
const getTiming = (sunrise, sunset, time, timezone, hourFormat = "24h") => {
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
  let Sunrise = formatTime(sunrise, timezone, hourFormat);
  let Sunset = formatTime(sunset, timezone, hourFormat);
  let clock = formatTime(time, timezone, hourFormat);
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
