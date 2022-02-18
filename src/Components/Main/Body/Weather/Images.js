import sunny_day from "../../../../imgs/sunny_day.jpg";
import partly_cloudy_day from "../../../../imgs/partly_cloudy_day.jpg";
import cloudy_day from "../../../../imgs/cloudy_day.jpg";
import snowy_day from "../../../../imgs/snowy_day.jpg";
import rainy_day from "../../../../imgs/rainy_day.jpg";
import shower_day from "../../../../imgs/shower_day.jpg";
import thunderstorm_day from "../../../../imgs/thunderstorm_day.jpg";
import foggy_day from "../../../../imgs/foggy_day.jpg";

export const setBackgroundImg = (forecast, id) => {
  forecast = forecast.toLowerCase();
  switch (forecast) {
    case "rain":
      if (id >= 500 && id <= 504) return rainy_day;
      return shower_day;
    case "drizzle":
      return rainy_day;
    case "snow":
      return snowy_day;
    case "clear":
      return sunny_day;
    case "clouds":
      if (id === 801) return partly_cloudy_day;
      return cloudy_day;
    case "thunderstorm":
      return thunderstorm_day;
    default:
      return foggy_day;
  }
}; 