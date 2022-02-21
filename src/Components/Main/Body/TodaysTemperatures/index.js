import React, { useContext, useEffect, useState } from 'react';
import axios from "axios"
import moment from "moment";
import WeatherContext from '../../../../contexts/WeatherContext';
import Error from "../../../Error"
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
  const { daily, hourly, lat, lon, timezone_offset } = weatherData;
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
      const weatherHistoryURL = `https://history.openweathermap.org/data/2.5/history/city?lat=${lat}&lon=${lon}&units=metric&type=hour&appid=99eb51721a50689c8175af2560a2b07c`;
      await axios
        .get(weatherHistoryURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          response.data.list.forEach((element) => {
            const { main, weather, dt: hourlyTime } = element;
 
            let localDay = moment.unix(dt).utcOffset(timezone_offset/3600).day()
            let hour = Number(moment.unix(hourlyTime).utcOffset(timezone_offset/3600).hours());
            let day = Number(moment.unix(hourlyTime).utcOffset(timezone_offset/3600).day());
            
            if (day === localDay) {
              let temperature = Math.ceil(main.temp);
              let icon = weather[0].icon;
              let data = { temperature, icon };
              if (hour >= 5 && hour < 8) temperaturesObject.more = data;
              else if (hour >= 11 && hour <= 14) temperaturesObject.day = data;
              else if (hour >= 16 && hour <= 19) temperaturesObject.eve = data;
              else if (hour >= 22 && hour <= 23) temperaturesObject.night = data;
            }
          });
          setTodayTemperatures((state) => ({ ...state, ...temperaturesObject }));
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
      let localDay = moment.unix(dt).utcOffset(timezone_offset / 3600).day();
      let hour = Number(moment.unix(hourlyTime).utcOffset(timezone_offset / 3600).hours());
      let day = Number(moment.unix(hourlyTime).utcOffset(timezone_offset / 3600).day());
      if (day === localDay) {
        const data = {
          temperature: Math.ceil(temp),
          icon: weather[0].icon,
        };
        if (hour >= 5 && hour < 8) temperaturesObject.more = data;
        else if (hour >= 11 && hour <= 14) temperaturesObject.day = data;
        else if (hour >= 16 && hour <= 19) temperaturesObject.eve = data;
        else if (hour >= 22 && hour <= 23) temperaturesObject.night = data;

       setTodayTemperatures((state) => ({ ...state, ...temperaturesObject }));
       setErrorLoading(false);
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
          (Object.keys(todayTemperatures).length === 4)? (
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
