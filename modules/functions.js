'use strict';

const superagent = require('superagent');

// Database connection
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

async function checkDB(SQL, city, minutesToExpire) {
  try {
    const query = await client.query(SQL, [city]);
    if(query.rowCount) {
      console.log(`${city} found in database`);
      if(minutesToExpire) {
        var timeDifference = (Date.now() - query.rows[0].time_saved) / 60000;
        console.log(`The result for ${city} was saved ${timeDifference.toFixed(2)} minutes ago`);
      }
      if(!minutesToExpire || timeDifference < minutesToExpire) {
        return query.rows;
      }
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
}

exports.checkLocation = async function checkLocation(city, res) {
  const SQL = 'SELECT * FROM locations WHERE search_query = $1';
  try {
    const location = await checkDB(SQL, city);
    if(location) {
      res.status(200).send(location[0]);
      return true;
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

exports.checkWeather = async function checkWeather(city, res) {
  const SQL = 'SELECT forecast, time, time_saved FROM weather JOIN locations ON weather.location_id = locations.id WHERE locations.search_query = $1';
  try {
    const weather = await checkDB(SQL, city, 60);
    if(weather) {
      res.status(200).send(weather);
      return true;
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

exports.checkEvent = async function checkEvent(city, res) {
  const SQL = 'SELECT link, name, event_date, summary, time_saved FROM events JOIN locations ON events.location_id = locations.id WHERE locations.search_query = $1';
  try {
    const event = await checkDB(SQL, city, (60 * 24));
    if(event) {
      res.status(200).send(event);
      return true;
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

exports.checkTrail = async function checkTrail(city, res) {
  const SQL = 'SELECT name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time, time_saved FROM trails JOIN locations ON trails.location_id = locations.id WHERE locations.search_query = $1';
  try {
    const trail = await checkDB(SQL, city, (60 * 24 * 7));
    if(trail) {
      res.status(200).send(trail);
      return true;
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

// Saving location into database
exports.saveLocations = async function saveLocations(object) {
  let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id';
  let safeValues = [object.search_query, object.formatted_query, object.latitude, object.longitude];
  try {
    await client.query(SQL, safeValues);
    console.log(`Location ${object.search_query} saved into database`);
    console.table(object);
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

exports.saveWeather = async function saveWeather(forecast, city) {
  let SQL = 'INSERT INTO weather (forecast, time, time_saved, location_id) VALUES ($1, $2, $3, (SELECT id FROM locations WHERE search_query LIKE $4))';
  let timeSaved = Date.now();
  let safeValues = [forecast.forecast, forecast.time, timeSaved, city];
  try {
    await client.query(SQL, safeValues);
    console.log('Saving weather for', city);
  } catch (error) {
    console.log('Weather couldn\'t be saved', error);
  }
};

exports.saveEvents = async function saveEvents(event, city) {
  let SQL = 'INSERT INTO events (link, name, event_date, summary, time_saved, location_id) VALUES ($1, $2, $3, $4, $5, (SELECT id FROM locations WHERE search_query LIKE $6))';
  let timeSaved = Date.now();
  let safeValues = [event.link, event.name, event.event_date, event.summary, timeSaved, city];
  try {
    await client.query(SQL, safeValues);
    console.log('Saving event for', city);
  } catch (error) {
    console.log('Event couldn\'t be saved', error);
  }
};

exports.saveTrails = async function saveTrails(trail, city) {
  let SQL = 'INSERT INTO trails (name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time, time_saved, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (SELECT id FROM locations WHERE search_query LIKE $12))';
  let timeSaved = Date.now();
  let safeValues = [trail.name, trail.location, trail.length, trail.stars, trail.star_votes, trail.summary, trail.trail_url, trail.conditions, trail.condition_date, trail.condition_time, timeSaved, city];
  try {
    await client.query(SQL, safeValues);
    console.log('Saving trail for', city);
  } catch (error) {
    console.log('Trail couldn\'t be saved', error);
  }
};

exports.clearTable = async function clearTable(table, city) {
  console.log('deleteing rows for ', city);
  let SQL = `DELETE FROM ${table} WHERE location_id = (SELECT id FROM locations WHERE search_query LIKE $1)`;
  await client.query(SQL, [city]);
};

// Fetch any API data
exports.fetchAPI = async function fetchAPI(url, api) {
  try {
    let apiData;
    if(api) {
      apiData = await superagent.get(url).set(api);
    } else {
      apiData = await superagent.get(url);
    }
    return apiData.body;
  } catch (error) {
    console.log('API call couldn\'t be completed, error status:', error.status);
  }
};

// dbHandler callback
exports.dbHandler = function dbHandler(req, res) {
  let SQL = 'SELECT * FROM locations';
  client.query(SQL)
    .then( results => {
      res.status(200).json(results.rows);
    });
};
