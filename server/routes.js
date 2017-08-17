var express = require('express');
var Meeting = require('../database-mongo/models/meeting.js');
const router = express.Router();
const config = require('./config.js');
var axios = require('axios');

// APIs
const gmaps = require('./google-maps.js');
const yelp = require('./yelp.js');

var routerInstance = function(io) {
  router.post('/meetings', function (req, res) {
    const { userId, userLocation, friendId } = req.body;

    //return if required fields are not found
    if (!req.body || !userId || !userLocation || !friendId) {
      console.error("required field(s) not filled");
      res.status(401).send('required field(s) not filled');
      return;
    }

    // update if found;
    Meeting.findOne({userId: userId}, (err, meeting) => {
      if (err) console.log('err at finding one meeting');
      if (meeting) {
        meeting.userLocation = userLocation;
        meeting.friendId = friendId;
        meeting.save((err, newMeeting) => {
          if (err) console.log('err at saving new meeting');
          if (newMeeting) {
            console.log('updated meeting:', newMeeting);
            res.send();
            return;
          } else {
            console.log('failed to update meeting');
            return;
          }
        });
      } else {
        var newMeeting = new Meeting({ userId, userLocation, friendId });
        newMeeting.save((err) => {
          if (err) {
            console.error("unicorn User already exists!");
            res.status(401).send('User already exists!');
            return;
          } else {
            console.log('New meeting saved!');
            res.send();
            return;
          }
        });
      }
    });
  });

  router.post('/two-locations', function(req, res) {
    const { userId, location1, location2, arrivalTime, transportation } = req.body;
    var APIKEY = config.google.APIKEY;

    var address1 = encodeURIComponent((location1.address).trim()); // Replaces spaces in path with %20
    var geocodeUrl1 = `https://maps.googleapis.com/maps/api/geocode/json?address=${address1}&key=${APIKEY}`;

    axios.get(geocodeUrl1)
      .then((geocode1) => {
        var lat1 = geocode1.data.results[0].geometry.location.lat;
        var lng1 = geocode1.data.results[0].geometry.location.lng;
        var coordinates1 = [ lat1, lng1 ];

        var address2 = encodeURIComponent((location2.address).trim()); // Replaces spaces in path with %20
        var geocodeUrl2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${address2}&key=${APIKEY}`;

        axios.get(geocodeUrl2)
          .then((geocode2) => {
            var lat2 = geocode2.data.results[0].geometry.location.lat;
            var lng2 = geocode2.data.results[0].geometry.location.lng;
            var coordinates2 = [ lat2, lng2 ];

            console.log('coordinates1', coordinates1);
            console.log('coordinates2', coordinates2);

            // get midpoint
            // gmaps.generateMidpoint(coordinates1, coordinates2)
            //   .then((midpoint) => {
            //     console.log('Midpoint generated:', midpoint);
            //     // Put midpoint in Yelp API
            //     yelp.yelpRequest(midpoint)
            //       .then((yelpLocations) => {
            //         // Re-render client
            //         io.sockets.emit('midpoint', { lat: midpoint.latitude, lng: midpoint.longitude });
            //         io.sockets.emit('meeting locations', yelpLocations);

            //         // formatted as { location1: [lat,lng], location2: [lat, lng] }
            //         io.sockets.emit('user locations', {
            //           location1: { lat: coordinates1[0], lng: coordinates1[1] },
            //           location2: { lat: coordinates2[0], lng: coordinates2[1] }
            //         })
            //       });
            //   });

            // send all points
            gmaps.generatePointsAlong(coordinates1, coordinates2, arrivalTime, transportation)
              .then(({ pointsAlong, midpoint, departure_time }) => {
                // Generate midpoint locations with higher search radius
                console.log('points along', pointsAlong);
                yelp.yelpRequest(midpoint, 10, 100)
                  .then((yelpLocations) => {
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
            res.send('Results found.');
          })
          .catch(err => console.log("Err getting geocode from Google API"), err);
      })
      .catch(err => console.log("Err getting geocode from Google API", err));
  });

  // TODO Getting the results of the match
  // router.get('/matches', function (req, res) {
  // });

  return router;
};


module.exports = routerInstance;
