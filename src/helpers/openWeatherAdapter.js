import moment from "moment";

const HOUR_IN_SECONDS = 3600;
const OUTLOOK_HOURS = 48;

const formatLocalDate = (dt, timezoneOffset) =>
  moment.unix(dt).utcOffset(timezoneOffset / 3600).format("YYYY-MM-DD");

const mapForecastEntry = (entry) => ({
  dt: entry.dt,
  temp: entry.main.temp,
  weather: entry.weather,
  pop: entry.pop ?? 0,
});

const roundUpToNextHour = (dt) =>
  Math.floor(dt / HOUR_IN_SECONDS) * HOUR_IN_SECONDS + HOUR_IN_SECONDS;

const build48HourSeriesFromAnchors = (anchors, current) => {
  const startDt = roundUpToNextHour(current.dt);
  const endDt = startDt + (OUTLOOK_HOURS - 1) * HOUR_IN_SECONDS;

  if (anchors.length < 2) {
    return [];
  }

  const hourly = [];
  let anchorIndex = 0;

  for (let dt = startDt; dt <= endDt; dt += HOUR_IN_SECONDS) {
    while (anchorIndex < anchors.length - 1 && anchors[anchorIndex + 1].dt < dt) {
      anchorIndex += 1;
    }

    const lower = anchors[anchorIndex];
    const upper = anchors[anchorIndex + 1];

    if (!lower || !upper) {
      return [];
    }

    if (dt === lower.dt) {
      hourly.push({
        dt,
        temp: lower.temp,
        weather: lower.weather,
        pop: lower.pop ?? 0,
        isInterpolated: false,
      });
      continue;
    }

    const span = upper.dt - lower.dt;
    const fraction = span > 0 ? (dt - lower.dt) / span : 0;
    const temp = lower.temp + (upper.temp - lower.temp) * fraction;

    hourly.push({
      dt,
      temp,
      weather: lower.weather,
      pop: lower.pop ?? 0,
      isInterpolated: true,
    });
  }

  return hourly;
};

const buildOneCall48HourOutlook = (hourlyForecast, current) =>
  build48HourSeriesFromAnchors(
    hourlyForecast.map((entry) => ({
      dt: entry.dt,
      temp: entry.temp,
      weather: entry.weather,
      pop: entry.pop ?? 0,
      isInterpolated: false,
    })),
    current
  );

const buildInterpolated48HourOutlook = (forecastList, current) =>
  build48HourSeriesFromAnchors(
    [
      {
        dt: current.dt,
        temp: current.temp,
        weather: current.weather,
        pop: 0,
        isInterpolated: false,
      },
      ...forecastList.map((entry) => ({
        dt: entry.dt,
        temp: entry.main.temp,
        weather: entry.weather,
        pop: entry.pop ?? 0,
        isInterpolated: false,
      })),
    ].sort((a, b) => a.dt - b.dt),
    current
  );

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

const buildGroupedDailySummary = (forecastList, timezoneOffset) => {
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
      humidity: middayEntry.main.humidity ?? null,
      wind_speed: middayEntry.wind?.speed ?? null,
    };
  });
};

const buildOneCallDailyForecast = (dailyForecast = []) =>
  dailyForecast.slice(0, 7).map((entry) => ({
    dt: entry.dt,
    temp: {
      day: Math.round(entry.temp?.day ?? entry.temp?.max ?? 0),
      min: Math.round(entry.temp?.min ?? 0),
      max: Math.round(entry.temp?.max ?? entry.temp?.day ?? 0),
    },
    feels_like: {
      day: Math.round(entry.feels_like?.day ?? entry.feels_like?.night ?? 0),
    },
    weather: entry.weather,
    pop: Math.round((entry.pop ?? 0) * 100),
    humidity: entry.humidity ?? null,
    wind_speed: entry.wind_speed ?? null,
    uvi: entry.uvi ?? null,
  }));

export const buildOpenWeatherPayload = (
  currentResponse,
  forecastResponse,
  uviResponse,
  oneCallResponse
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

  const timezone_offset =
    oneCallResponse?.data?.timezone_offset ?? forecastResponse.data.city.timezone;
  const forecastList = forecastResponse.data.list;
  const hourly = buildHourlyForToday(forecastList, current, timezone_offset);
  const oneCallHourly = oneCallResponse?.data?.hourly ?? [];
  const oneCallOutlook = buildOneCall48HourOutlook(oneCallHourly, current);
  const outlook48h =
    oneCallOutlook.length === OUTLOOK_HOURS
      ? oneCallOutlook
      : buildInterpolated48HourOutlook(forecastList, current);
  const outlook48hSource =
    oneCallOutlook.length === OUTLOOK_HOURS
      ? "OpenWeather One Call 3.0"
      : "interpolated 3-hour fallback";
  const oneCallDaily = buildOneCallDailyForecast(oneCallResponse?.data?.daily);
  const daily =
    oneCallDaily.length >= 7
      ? oneCallDaily
      : buildGroupedDailySummary(forecastList, timezone_offset).slice(0, 7);
  const dailySource =
    oneCallDaily.length >= 7
      ? "OpenWeather One Call 3.0 daily"
      : "grouped 3-hour fallback";

  console.log(`48-hour outlook source: ${outlook48hSource}`);
  console.log(`7-day forecast source: ${dailySource}`);

  return {
    current,
    hourly,
    outlook24h: outlook48h,
    outlook48h,
    outlook48hSource,
    daily,
    dailySource,
    timezone_offset,
    dt: current.dt,
    coord: current.coord,
  };
};
