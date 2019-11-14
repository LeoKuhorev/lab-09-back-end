'use strict';

const path = require('path');
const helperFunctions = require(path.join(__dirname, 'functions.js'));
const checkTrail = helperFunctions.checkTrail;
const saveTrails = helperFunctions.saveTrails;
const clearTable = helperFunctions.clearTable;

const fetchAPI = helperFunctions.fetchAPI;

function Trail(object) {
  this.name = object.name;
  this.location = object.location;
  this.length = object.length;
  this.stars = object.stars;
  this.star_votes = object.starVotes;
  this.summary = object.summary;
  this.trail_url = object.url;
  this.conditions = object.conditionStatus;
  this.condition_date = object.conditionDate.slice(0, 10);
  this.condition_time = object.conditionDate.slice(11);
}

exports.trailHandler = async function trailHandler(req, res) {
  try {
    let trailFound = await checkTrail(req.query.data.search_query, res);
    if(!trailFound) {
      const url = `https://www.hikingproject.com/data/get-trails?lat=${req.query.data.latitude}&lon=${req.query.data.longitude}&key=${process.env.TRAIL_API_KEY}`;
      const trailBody = await fetchAPI(url);
      await clearTable('trails', req.query.data.search_query);
      const trailData = trailBody.trails.map(element => new Trail(element));
      trailData.forEach(trail => saveTrails(trail, req.query.data.search_query));
      res.status(200).send(trailData);
    }
  }
  catch (error) {
    console.log('Sorry, something went wrong', req, res);
  }
};
