'use strict';

// Load Environment veriable from the .env
require('dotenv').config();

// Declare Application Dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');

// Bringing in modules
const SQL = require(path.join(__dirname, 'modules', 'functions.js'));

const checkWeather = SQL.checkWeather;
const saveWeather = SQL.saveWeather;
const clearWeather = SQL.clearWeather;

const checkEvent = SQL.checkEvent;
const saveEvents = SQL.saveEvents;
const clearEvent = SQL.clearEvent;

const fetchAPI = SQL.fetchAPI;


const Location = require(path.join(__dirname, 'modules', 'location.js'));
const locationHandler = Location.locationHandler;

const Event = require(path.join(__dirname, 'modules', 'events.js'));
const Weather = require(path.join(__dirname, 'modules', 'weather.js'));
const Trail = require(path.join(__dirname, 'modules', 'trail.js'));

// Database connection
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

// Application setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// API routes
// Serving static folder
app.use(express.static(path.join(__dirname, 'public')));

// Specifying the routes
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.get('/events', eventsHandler);
app.get('/db', dbHandler);
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Helper functions

// Event Handlers

async function weatherHandler(req, res) {
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
    errorHandler('Sorry, something went wrong', req, res);
  }
}

async function trailHandler(req, res) {
  try {
    const url = `https://www.hikingproject.com/data/get-trails?lat=${req.query.data.latitude}&lon=${req.query.data.longitude}&key=${process.env.TRAIL_API_KEY}`;
    const trailBody = await fetchAPI(url);
    const trailData = trailBody.trails.map(element => new Trail(element));
    res.status(200).send(trailData);
  }
  catch (error) {
    errorHandler('Sorry, something went wrong', req, res);
  }
}

async function eventsHandler(req, res) {
  try {
    let eventFound = await checkEvent(req.query.data.search_query, res);
    if(!eventFound) {
      const url = `https://www.eventbriteapi.com/v3/events/search/?location.longitude=${req.query.data.longitude}&location.latitude=${req.query.data.latitude}&expand=venue&token=${process.env.EVENTBRITE_API_KEY}`;
      const eventsData = await fetchAPI(url);
      await clearEvent(req.query.data.search_query);
      const events = eventsData.events.map(element => new Event(element));
      events.forEach(event => saveEvents(event, req.query.data.search_query));
      res.status(200).send(events);
    }
  }
  catch (error) {
    errorHandler('Sorry, something went wrong', req, res);
  }
}

function dbHandler(req, res) {
  let SQL = 'SELECT * FROM locations';
  client.query(SQL)
    .then( results => {
      res.status(200).json(results.rows);
    });
}

function errorHandler(error, req, res) {
  res.status(500).send(error);
}

// Ensure that the server is listening for requests
app.listen(PORT, () => console.log(`The server is up listening on ${PORT}`));

