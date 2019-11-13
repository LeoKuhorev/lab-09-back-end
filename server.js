'use strict';

// Load Environment veriable from the .env
require('dotenv').config();

// Declare Application Dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');

// Bringing in modules
const helperFunctions = require(path.join(__dirname, 'modules', 'functions.js'));

const checkEvent = helperFunctions.checkEvent;
const saveEvents = helperFunctions.saveEvents;
const clearEvent = helperFunctions.clearEvent;

const fetchAPI = helperFunctions.fetchAPI;
const dbHandler = helperFunctions.dbHandler;

const Location = require(path.join(__dirname, 'modules', 'location.js'));
const locationHandler = Location.locationHandler;

const Weather = require(path.join(__dirname, 'modules', 'weather.js'));
const weatherHandler = Weather.weatherHandler;

const Event = require(path.join(__dirname, 'modules', 'events.js'));
const Trail = require(path.join(__dirname, 'modules', 'trail.js'));

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

// Event Handlers

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

function errorHandler(error, req, res) {
  res.status(500).send(error);
}

// Ensure that the server is listening for requests
app.listen(PORT, () => console.log(`The server is up listening on ${PORT}`));

