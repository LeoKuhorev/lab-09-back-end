'use strict';

const path = require('path');
const helperFunctions = require(path.join(__dirname, 'functions.js'));
const checkEvent = helperFunctions.checkEvent;
const saveEvents = helperFunctions.saveEvents;
const clearTable = helperFunctions.clearTable;

const fetchAPI = helperFunctions.fetchAPI;


function Event(object) {
  this.link = object.url;
  this.name = object.name.text;
  this.event_date = object.start.local.slice(0, 10);
  this.summary = object.summary;
}

exports.eventsHandler = async function eventsHandler(req, res) {
  try {
    let eventFound = await checkEvent(req.query.data.search_query, res);
    if(!eventFound) {
      const url = `https://www.eventbriteapi.com/v3/events/search/?location.longitude=${req.query.data.longitude}&location.latitude=${req.query.data.latitude}&expand=venue&token=${process.env.EVENTBRITE_API_KEY}`;
      const eventsData = await fetchAPI(url);
      await clearTable('events', req.query.data.search_query);
      const events = eventsData.events.map(element => new Event(element));
      events.forEach(event => saveEvents(event, req.query.data.search_query));
      res.status(200).send(events);
    }
  }
  catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};
