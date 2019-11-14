'use strict';

const path = require('path');
const helperFunctions = require(path.join(__dirname, 'functions.js'));

const fetchAPI = helperFunctions.fetchAPI;

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}


exports.movieHandler = async function movieHandler(req, res) {
  try {
    // let weatherFound = await checkWeather(req.query.data.search_query, res);
    // if(!weatherFound) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${req.query.data.search_query}&api_key=${process.env.MOVIE_API_KEY}`;
    const moviesData = await fetchAPI(url);
    // await clearTable('weather', req.query.data.search_query);
    const movies = moviesData.results.map(element => new Movie(element));
    // forecasts.forEach(forecast => saveWeather(forecast, req.query.data.search_query));
    console.log(movies);
    res.status(200).send(movies);
    // }
  } catch (error) {
    console.log('Sorry, something went wrong', error);
  }
};
