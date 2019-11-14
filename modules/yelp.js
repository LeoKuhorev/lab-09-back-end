'use strict';
const path = require('path');
const helperFunctions = require(path.join(__dirname, 'functions.js'));

const fetchAPI = helperFunctions.fetchAPI;

function Yelp(business) {
  this.name = business.name;
  this.image_url = business.image_url;
  this.price = business.price;
  this.rating = business.rating;
  this.url = business.url;
}


exports.yelpHandler = async function yelpHandler(req, res) {
  try {
    // let yelpFound = await checkyelp(req.query.data.search_query, res);
    // if(!yelpFound) {
    const url = `https://api.yelp.com/v3/businesses/search?latitude=${req.query.data.latitude}&longitude=${req.query.data.longitude}`;
    const api = {'Authorization' : `Bearer ${process.env.YELP_API_KEY}`};
    const yelpData = await fetchAPI(url, api);
    // await clearTable('yelp', req.query.data.search_query);
    const businesses = yelpData.businesses.map(element => new Yelp(element));
    // businesses.forEach(business => saveYelp(business, req.query.data.search_query));
    res.status(200).send(businesses);
    // }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};

