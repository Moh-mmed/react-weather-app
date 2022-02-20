import React, { useContext, useEffect, useState } from 'react';
import axios from "axios"
import moment from "moment";
import WeatherContext from '../../../../contexts/WeatherContext';
import WidgetError from "../../../WidgetError"
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
  const { daily, hourly, lat, lon } = weatherData
  const { dt } = weatherData.current;
  const { main, id} = daily[1].weather[0];
  const tomorrowTemp = Math.ceil(daily[1].temp.day);
  const backImg = setBackgroundImg(main, id);
  const month = moment(dt * 1000).month();
  const season = findSeason(month)

  let temperaturesObject = {}
  //Find today's historical temperatures
  useEffect(() => {
    const todayWeatherHistory = async () => {
      const milliseconds = (moment.unix(dt).hours() - 2) * 3600;
      const startTime = dt - milliseconds;
      const weatherHistoryURL = `https://history.openweathermap.org/data/2.5/history/city?lat=${lat}&lon=${lon}&units=metric&type=hour&start=${startTime}&appid=99eb51721a50689c8175af2560a2b07c`;
      await axios
        .get(weatherHistoryURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          response.data.list.forEach((element) => {
            const { main, weather, dt: hourlyTime } = element;
            const hour = Number(moment.unix(hourlyTime).hours());
            const temperature = Math.ceil(main.temp);
            const icon = weather[0].icon;
            const data = { temperature, icon };
            if (hour === 6)temperaturesObject.more = data;
            else if (hour === 12)temperaturesObject.day = data;
            else if (hour === 18)temperaturesObject.eve = data;
            else if (hour === 23) temperaturesObject.night = data;
          });
          setTodayTemperatures(temperaturesObject);
          setErrorLoading(false)
        })
        .catch((err) => {
          console.log(err);
          setErrorLoading(true)
        });
    };

    // Get todays' passed hours
    todayWeatherHistory();
    // Get todays' rest hours
    hourly.forEach((element) => {
      const { temp, weather, dt: hourlyTime } = element;
      let hour = Number(moment.unix(hourlyTime).hours());
      let day = Number(moment.unix(hourlyTime).day());
      if (day === moment.unix(dt).day()) {
        const data = {
          temperature: Math.ceil(temp),
          icon: weather[0].icon,
        };
        if (hour === 6) temperaturesObject.more = data;
        else if (hour === 12) temperaturesObject.day = data;
        else if (hour === 18) temperaturesObject.eve = data;
        else if (hour === 23) temperaturesObject.night = data;
      }
    });

  }, [weatherData]);
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
          Object.keys(todayTemperatures).length ? (
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
            <div>loading</div>
          )
        ) : (
          <WidgetError />
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
