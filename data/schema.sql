DROP TABLE IF EXISTS locations, weather, events, trails, yelp, movies;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query TEXT,
  formatted_query TEXT,
  latitude DECIMAL,
  longitude DECIMAL
);

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  forecast TEXT,
  time TEXT,
  time_saved BIGINT,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  link TEXT,
  name TEXT,
  event_date TEXT,
  summary TEXT,
  time_saved BIGINT,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE trails (
  id SERIAL PRIMARY KEY,
  name TEXT,
  location TEXT,
  length TEXT,
  stars TEXT,
  star_votes TEXT,
  summary TEXT,
  trail_url TEXT,
  conditions TEXT,
  condition_date TEXT,
  condition_time TEXT,
  time_saved BIGINT,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE yelp (
  id SERIAL PRIMARY KEY,
  name TEXT,
  image_url TEXT,
  price TEXT,
  rating TEXT,
  url TEXT,
  time_saved BIGINT,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT,
  overview TEXT,
  average_votes TEXT,
  total_votes TEXT,
  image_url TEXT,
  popularity TEXT,
  released_on TEXT,
  time_saved BIGINT,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);