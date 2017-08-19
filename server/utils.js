
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

module.exports.getLocationsAndSend = (coordinates1, coordinates2, arrivalTime, transportation, io) => {
  gmaps.generatePointsAlong(coordinates1, coordinates2, arrivalTime, transportation)
    .then(({ pointsAlong, midpoint, departure_time }) => {
      // Generate midpoint locations with higher search radius
      console.log('points along', pointsAlong);
      yelp.yelpRequest(midpoint, 10, 100)
        .then((yelpLocations) => {
          io.sockets.emit('match status', {
            statusMessage: 'Location Found',
          });
          io.sockets.emit('midpoint', { lat: midpoint.latitude, lng: midpoint.longitude });
          io.sockets.emit('mid meeting locations', yelpLocations)
          // formatted as { location1: [lat,lng], location2: [lat, lng] }
          io.sockets.emit('user locations', {
            location1: { lat: coordinates1[0], lng: coordinates1[1] },
            location2: { lat: coordinates2[0], lng: coordinates2[1] },
          });
        });
      const mappedYelp = pointsAlong.map((point) => {
        // points.forEach(point => {
        return yelp.yelpRequest(point, 3)
          .then((yelpLocations) => {
            // Re-render client
            return yelpLocations;
          });
      });
      // Generate all restaurants along the path
      Promise.all(mappedYelp)
        .then((locationsArr) => {
          // MERGE ARRAY OF ARRAYS
          const allMeetingLocations = [].concat.apply([], locationsArr);
          io.sockets.emit('all meeting locations', allMeetingLocations );
        })
        .catch(err => console.log("Error with promise all"), err);
    })
    .catch(err => console.log(err));
}