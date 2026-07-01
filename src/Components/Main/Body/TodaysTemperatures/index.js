import React, { useContext, useEffect, useState } from 'react';
import moment from "moment";
import WeatherContext from '../../../../contexts/WeatherContext';
import Error from "../../../Error";
import Spinner from '../../../Spinner';
import { setBackgroundImg } from "./Images";
import { findSeason } from '../../../../helpers/findSeason';
import {
  StyledTemperatures,
  StyledTempHeading,
  StyledHeading,
  StyledTempTomorrow,
  StyledTodaysWeather,
} from "./StyledTodaysWeatherComponents";
import DayTemp from './DayTemp';

const TodaysTemperatures = () => {
  const { weatherData } = useContext(WeatherContext);
  const [todayTemperatures, setTodayTemperatures] = useState({});
  const [errorLoading, setErrorLoading] = useState(false);
  const { daily, current, hourly } = weatherData;
  const { main, id } = daily[1].weather[0];
  const tomorrowTemp = Math.ceil(daily[1].temp.day);
  const backImg = setBackgroundImg(main, id);
  const month = moment(current.dt * 1000).month();
  const season = findSeason(month);

  useEffect(() => {
    let isMounted = true;

    if (!weatherData || !current || !hourly?.length) {
      setTodayTemperatures({});
      setErrorLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const { dt, timezone_offset } = weatherData;
    const groupEntries = hourly.filter((entry) => {
      const localDay = moment.unix(dt).utcOffset(timezone_offset / 3600).day();
      const entryDay = moment
        .unix(entry.dt)
        .utcOffset(timezone_offset / 3600)
        .day();
      return entryDay === localDay;
    });

    const chooseEntryForRange = (start, end, fallback) => {
      const matched = groupEntries.find((entry) => {
        const hour = Number(
          moment.unix(entry.dt).utcOffset(timezone_offset / 3600).hour()
        );
        return hour >= start && hour <= end;
      });
      if (matched) return matched;
      if (!groupEntries.length) return fallback;

      const target = Math.round((start + end) / 2);
      return groupEntries.reduce((closest, entry) => {
        const hour = Number(
          moment.unix(entry.dt).utcOffset(timezone_offset / 3600).hour()
        );
        const closestHour = Number(
          moment.unix(closest.dt).utcOffset(timezone_offset / 3600).hour()
        );
        return Math.abs(hour - target) < Math.abs(closestHour - target)
          ? entry
          : closest;
      }, groupEntries[0]);
    };

    const baseEntry = {
      dt: current.dt,
      temp: current.temp,
      weather: current.weather,
    };

    const temperaturesObject = {
      more: chooseEntryForRange(5, 8, baseEntry),
      day: chooseEntryForRange(11, 14, baseEntry),
      eve: chooseEntryForRange(16, 19, baseEntry),
      night: chooseEntryForRange(22, 23, baseEntry),
    };

    if (isMounted) {
      setTodayTemperatures(
        Object.fromEntries(
          Object.entries(temperaturesObject).map(([key, entry]) => [
            key,
            {
              temperature: Math.ceil(entry?.temp ?? 0),
              icon: entry?.weather?.[0]?.icon ?? "01d",
            },
          ])
        )
      );
      setErrorLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [weatherData, current, hourly]);

  const hasDayData = Boolean(
    todayTemperatures.more && todayTemperatures.day && todayTemperatures.eve && todayTemperatures.night
  );

  return (
    <StyledTodaysWeather>
      <StyledTempHeading>
        <StyledHeading>
          How's the <br />
          temperature today?
        </StyledHeading>
      </StyledTempHeading>
      <StyledTemperatures variant={errorLoading}>
        {!errorLoading ? (
          hasDayData ? (
            <>
              <DayTemp
                time="morning"
                season={season}
                data={todayTemperatures.more}
              />
              <DayTemp
                time="afternoon"
                season={season}
                data={todayTemperatures.day}
              />
              <DayTemp
                time="evening"
                season={season}
                data={todayTemperatures.eve}
              />
              <DayTemp
                time="night"
                season={season}
                data={todayTemperatures.night}
              />
            </>
          ) : (
            <Spinner />
          )
        ) : (
          <Error />
        )}
      </StyledTemperatures>
      <StyledTempTomorrow img={backImg} alt="tomorrow's weather">
        <div>Tomorrow</div>
        <div>
          <span>{tomorrowTemp}°c</span>
          <span>{main}</span>
        </div>
      </StyledTempTomorrow>
    </StyledTodaysWeather>
  );
};

export default TodaysTemperatures;
