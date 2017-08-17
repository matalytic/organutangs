
const axios = require('axios');
const gmaps = require('./google-maps.js');
const yelp = require('./yelp.js');


const config = require('./config.js');

const APIKEY = config.google.APIKEY;

module.exports.LatLngToAddress = (coordinates) => {
  const lat = coordinates.coords.latitude;
  const long = coordinates.coords.longitude;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${APIKEY}`;
  return axios.get(url);
}
