// TODO : Make a get request to the Yelp API and get a list of locations
const config = require('./config.js');
const axios = require('axios');
const Yelp = require('node-yelp-api-v3');

const yelp = new Yelp({
  consumer_key: config.yelpClientID,
  consumer_secret: config.yelpClientSecret
});

var yelpRequest = (location, limit = 10, dist = 500, term = 'food') => {
  const long = location.longitude;
  const lat = location.latitude;

  return yelp.searchBusiness({
      term: term,
      latitude: lat,
      longitude: long,
      radius: dist,
      limit: limit
    })
    .then((res) => {
      var list = res.businesses;
      // for (var i = 0; i < res.businesses.length; i++) {
      //   list.push(res.businesses[i].coordinates);
      // }
      return list;
    })
  .catch((err) => {
    console.error(err);
  });
};

// var newYork = {latitude: 40.751094, longitude: -73.987597};
// yelpRequest(newYork);

module.exports.yelpRequest = yelpRequest;