'use strict';

class Trail {
  constructor(object) {
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
}

module.exports = Trail;
