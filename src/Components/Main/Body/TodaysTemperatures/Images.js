import sunny_tomorrow from "../../../../imgs/sunny_tomorrow.jpg";
import partly_cloudy_tomorrow from "../../../../imgs/partly_cloudy_tomorrow.jpg";
import cloudy_tomorrow from "../../../../imgs/cloudy_tomorrow.jpg";
import snowy_tomorrow from "../../../../imgs/snowy_tomorrow.jpg";
import rainy_tomorrow from "../../../../imgs/rainy_tomorrow.jpg";
import shower_tomorrow from "../../../../imgs/shower_tomorrow.jpg";
import thunderstorm_tomorrow from "../../../../imgs/thunderstorm_tomorrow.jpg";
import foggy_tomorrow from "../../../../imgs/foggy_tomorrow.jpg";

export const setBackgroundImg = (forecast, id) => {
  forecast = forecast.toLowerCase();
  switch (forecast) {
    case "rain":
      if (id >= 500 && id <= 504) return rainy_tomorrow;
      return shower_tomorrow;
    case "drizzle":
      return rainy_tomorrow;
    case "snow":
      return snowy_tomorrow;
    case "clear":
      return sunny_tomorrow;
    case "clouds":
      if (id === 801) return partly_cloudy_tomorrow;
      return cloudy_tomorrow;
    case "thunderstorm":
      return thunderstorm_tomorrow;
    default:
      return foggy_tomorrow;
  }
}; 