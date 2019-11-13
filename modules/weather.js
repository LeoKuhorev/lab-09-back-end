'use strict';

class Weather {
  constructor(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toString().slice(0, 15);
  }
}

module.exports = Weather;
