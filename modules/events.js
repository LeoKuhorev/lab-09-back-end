'use strict';

class Event {
  constructor(object) {
    this.link = object.url;
    this.name = object.name.text;
    this.event_date = object.start.local.slice(0, 10);
    this.summary = object.summary;
  }
}

module.exports = Event;
