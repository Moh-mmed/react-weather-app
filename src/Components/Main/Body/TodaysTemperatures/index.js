import React, { useContext, useEffect, useState } from 'react';
import axios from "axios"
import moment from "moment";
import WeatherContext from '../../../../WeatherContext';
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
  const {weatherData } = useContext(WeatherContext);
  const [todayTemperatures, setTodayTemperatures] = useState({});
  const { daily, hourly, lat, lon } = weatherData
  const { dt } = weatherData.current;
  const { main, id} = daily[1].weather[0];
  const tomorrowTemp = Math.ceil(daily[1].temp.day);
  const backImg = setBackgroundImg(main, id);
  const month = moment(dt * 1000).month();
  const season = findSeason(month)
  useEffect(() => {
    setTodayTemperatures({})
    const todayWeatherHistory = async () => {
      const milliseconds = (moment.unix(dt).hours()-2)*3600;
      const startTime = dt - milliseconds;
      const weatherHistoryURL = `https://history.openweathermap.org/data/2.5/history/city?lat=${lat}&lon=${lon}&units=metric&type=hour&start=${startTime}&appid=99eb51721a50689c8175af2560a2b07c`;
      await axios
        .get(weatherHistoryURL, {
          headers: { Accept: "application/json" },
        })
        .then((response) => {
          response.data.list.forEach((element) => {
            const {main, weather, dt} = element
            const hour = Number(moment(dt * 1000).hours());
            const day = Number(moment(dt * 1000).day());
            if (day === moment(dt * 1000).day()) {
              const temperature = Math.ceil(main.temp);
              const icon = weather[0].icon;
              const data = { temperature, icon };
              if (hour === 6) setTodayTemperatures((state)=>({...state, more: data}));
              else if (hour === 12) setTodayTemperatures((state) => ({ ...state, day: data }));
              else if (hour === 18) setTodayTemperatures((state) => ({ ...state, eve: data }));
              else if (hour === 23) setTodayTemperatures((state) => ({ ...state, night: data }));
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    todayWeatherHistory();

    hourly.forEach((element) => {
      const { temp, weather, dt } = element;
      let hour = Number(moment(dt * 1000).hours());
      let day = Number(moment(dt * 1000).day());
      if (day === moment(dt * 1000).day()) {
         const temperature = Math.ceil(temp);
         const icon = weather[0].icon;
         const data = { temperature, icon };
              if (hour === 6)
                setTodayTemperatures((state) => ({ ...state, more: data }));
              else if (hour === 12)
                setTodayTemperatures((state) => ({ ...state, day: data }));
              else if (hour === 18)
                setTodayTemperatures((state) => ({ ...state, eve: data }));
              else if (hour === 23)
                setTodayTemperatures((state) => ({ ...state, night: data }));
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
      <StyledTemperatures>
        {Object.keys(todayTemperatures).length === 4 && (
          <>
            <DayTemp time="morning" season={season} data={todayTemperatures.more}/>
            <DayTemp time="afternoon" season={season} data={todayTemperatures.day} />
            <DayTemp time="evening" season={season} data={todayTemperatures.eve} />
            <DayTemp time="night" season={season} data={todayTemperatures.night} />
          </>
        )}
      </StyledTemperatures>
      <StyledTempTomorrow img={backImg}>
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
