'use strict';

const path = require('path');
const helperFunctions = require(path.join(__dirname, 'functions.js'));
const checkWeather = helperFunctions.checkWeather;
const saveWeather = helperFunctions.saveWeather;
const clearWeather = helperFunctions.clearWeather;

const fetchAPI = helperFunctions.fetchAPI;

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

exports.weatherHandler = async function weatherHandler(req, res) {
  try {
    let weatherFound = await checkWeather(req.query.data.search_query, res);
    if(!weatherFound) {
      const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;
      const weatherData = await fetchAPI(url);
      await clearWeather(req.query.data.search_query);
      const forecasts = weatherData.daily.data.map(element => new Weather(element));
      forecasts.forEach(forecast => saveWeather(forecast, req.query.data.search_query));
      res.status(200).send(forecasts);
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

