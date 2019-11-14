'use strict';

const path = require('path');
const helperFunctions = require(path.join(__dirname, 'functions.js'));
const checkLocation = helperFunctions.checkLocation;
const saveLocations = helperFunctions.saveLocations;
const fetchAPI = helperFunctions.fetchAPI;

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

exports.locationHandler = async function locationHandler(req, res) {
  const city = req.query.data;
  try {
    let cacheFound = await checkLocation(city, res);
    if(!cacheFound) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;
      const geoData = await fetchAPI(url);
      const location = new Location(city, geoData);
      saveLocations(location);
      res.status(200).send(location);
    }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};
