import moment from "moment";

const formatLocalDate = (dt, timezoneOffset) =>
  moment.unix(dt).utcOffset(timezoneOffset / 3600).format("YYYY-MM-DD");

const buildHourlyForToday = (forecastList, current, timezoneOffset) => {
  const todayDate = formatLocalDate(current.dt, timezoneOffset);
  const todayEntries = forecastList
    .filter((entry) => formatLocalDate(entry.dt, timezoneOffset) === todayDate)
    .map((entry) => ({
      dt: entry.dt,
      temp: entry.main.temp,
      weather: entry.weather,
    }));

  const currentEntry = {
    dt: current.dt,
    temp: current.temp,
    weather: current.weather,
  };

  const hourly = [currentEntry, ...todayEntries].sort((a, b) => a.dt - b.dt);
  return hourly;
};

const buildDailySummary = (forecastList, timezoneOffset) => {
  const grouped = forecastList.reduce((acc, item) => {
    const dateKey = formatLocalDate(item.dt, timezoneOffset);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return Object.values(grouped).map((items) => {
    const middayEntry =
      items.find((item) => {
        const hour = Number(
          moment.unix(item.dt).utcOffset(timezoneOffset / 3600).hour()
        );
        return hour >= 11 && hour <= 15;
      }) || items[0];

    return {
      dt: middayEntry.dt,
      temp: { day: Math.round(middayEntry.main.temp) },
      feels_like: { day: Math.round(middayEntry.main.feels_like) },
      weather: middayEntry.weather,
    };
  });
};

export const buildOpenWeatherPayload = (
  currentResponse,
  forecastResponse,
  uviResponse
) => {
  const currentData = currentResponse.data;
  const main = currentData.main || {};
  const wind = currentData.wind || {};

  const current = {
    ...currentData,
    temp: main.temp ?? null,
    feels_like: main.feels_like ?? null,
    pressure: main.pressure ?? null,
    humidity: main.humidity ?? null,
    visibility: currentData.visibility ?? null,
    wind_deg: wind.deg ?? null,
    sunrise: currentData.sys?.sunrise ?? null,
    sunset: currentData.sys?.sunset ?? null,
    uvi: uviResponse?.data?.value ?? null,
  };

  const timezone_offset = forecastResponse.data.city.timezone;
  const hourly = buildHourlyForToday(
    forecastResponse.data.list,
    current,
    timezone_offset
  );
  const daily = buildDailySummary(forecastResponse.data.list, timezone_offset);

  return {
    current,
    hourly,
    daily,
    timezone_offset,
    dt: current.dt,
    coord: current.coord,
  };
};
