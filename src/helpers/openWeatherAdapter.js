import moment from "moment";

const formatLocalDate = (dt, timezoneOffset) =>
  moment.unix(dt).utcOffset(timezoneOffset / 3600).format("YYYY-MM-DD");

const mapForecastEntry = (entry) => ({
  dt: entry.dt,
  temp: entry.main.temp,
  weather: entry.weather,
  pop: entry.pop ?? 0,
});

const build24HourOutlook = (forecastList, current, timezoneOffset) => {
  const now = current.dt;
  const horizon = now + 24 * 3600;
  const upcoming = forecastList
    .filter((entry) => entry.dt >= now && entry.dt <= horizon)
    .map(mapForecastEntry);

  const currentEntry = {
    dt: current.dt,
    temp: current.temp,
    weather: current.weather,
    pop: 0,
    isNow: true,
  };

  return [currentEntry, ...upcoming].sort((a, b) => a.dt - b.dt);
};

const buildHourlyForToday = (forecastList, current, timezoneOffset) => {
  const todayDate = formatLocalDate(current.dt, timezoneOffset);
  const todayEntries = forecastList
    .filter((entry) => formatLocalDate(entry.dt, timezoneOffset) === todayDate)
    .map(mapForecastEntry);

  const currentEntry = {
    dt: current.dt,
    temp: current.temp,
    weather: current.weather,
    pop: 0,
  };

  return [currentEntry, ...todayEntries].sort((a, b) => a.dt - b.dt);
};

const buildDailySummary = (forecastList, timezoneOffset) => {
  const grouped = forecastList.reduce((acc, item) => {
    const dateKey = formatLocalDate(item.dt, timezoneOffset);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return Object.values(grouped).map((items) => {
    const temps = items.map((item) => item.main.temp);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));
    const maxPop = Math.round(Math.max(...items.map((item) => item.pop ?? 0)) * 100);

    const middayEntry =
      items.find((item) => {
        const hour = Number(
          moment.unix(item.dt).utcOffset(timezoneOffset / 3600).hour()
        );
        return hour >= 11 && hour <= 15;
      }) || items[0];

    return {
      dt: middayEntry.dt,
      temp: { day: max, min, max },
      feels_like: { day: Math.round(middayEntry.main.feels_like) },
      weather: middayEntry.weather,
      pop: maxPop,
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
    wind_speed: wind.speed ?? null,
    clouds: currentData.clouds?.all ?? null,
    sunrise: currentData.sys?.sunrise ?? null,
    sunset: currentData.sys?.sunset ?? null,
    uvi: uviResponse?.data?.value ?? null,
  };

  const timezone_offset = forecastResponse.data.city.timezone;
  const forecastList = forecastResponse.data.list;
  const hourly = buildHourlyForToday(forecastList, current, timezone_offset);
  const outlook24h = build24HourOutlook(forecastList, current, timezone_offset);
  const daily = buildDailySummary(forecastList, timezone_offset);

  return {
    current,
    hourly,
    outlook24h,
    daily,
    timezone_offset,
    dt: current.dt,
    coord: current.coord,
  };
};
