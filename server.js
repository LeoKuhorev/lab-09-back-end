'use strict';

// Load Environment veriable from the .env
require('dotenv').config();

// Declare Application Dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');

// Bringing in modules
const helperFunctions = require(path.join(__dirname, 'modules', 'functions.js'));

const fetchAPI = helperFunctions.fetchAPI;
const dbHandler = helperFunctions.dbHandler;

const Location = require(path.join(__dirname, 'modules', 'location.js'));
const locationHandler = Location.locationHandler;

const Weather = require(path.join(__dirname, 'modules', 'weather.js'));
const weatherHandler = Weather.weatherHandler;

const Event = require(path.join(__dirname, 'modules', 'events.js'));
const eventsHandler = Event.eventsHandler;

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

function errorHandler(error, req, res) {
  res.status(500).send(error);
}

// Ensure that the server is listening for requests
app.listen(PORT, () => console.log(`The server is up listening on ${PORT}`));

