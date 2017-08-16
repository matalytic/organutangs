const config = require('./config.js');
const APIKEY = config.google.APIKEY;
const axios = require('axios');

module.exports.LatLngToAddress = (coordinates) => {
  const lat = coordinates.coords.latitude;
  const long = coordinates.coords.longitude;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${APIKEY}`;
  return axios.get(url);
}