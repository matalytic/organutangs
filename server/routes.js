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
    var { userId, location1, location2, arrivalTime } = req.body;
    var APIKEY = config.google.APIKEY;

    var address1 = encodeURIComponent((location1.address).trim()); // Replaces spaces in path with %20
    var geocodeUrl1 = `https://maps.googleapis.com/maps/api/geocode/json?address=${address1}&key=${APIKEY}`;

    axios.get(geocodeUrl1)
      .then((geocode1) => {
        var lat1 = geocode1.data.results[0].geometry.location.lat;
        var lng1 = geocode1.data.results[0].geometry.location.lng;
        var coordinates1 = [ lat1, lng1 ];

        // find friend's location in DB
        if (!location2.address.includes(' ')) {
          console.log('USING FRIEND NAME');
          Meeting.findOne({userId: location2.address}, (err, meeting) => {
            if (err) {
              console.log('err at finding one meeting')
              res.send('err at finding one meeting');
            };
            if (meeting) {
              location2 = meeting.userLocation;
              // meeting.userLocation = userLocation;
              // meeting.friendId = friendId;
              var address2 = encodeURIComponent((location2.address).trim()); // Replaces spaces in path with %20
              var geocodeUrl2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${address2}&key=${APIKEY}`;

              axios.get(geocodeUrl2)
                .then((geocode2) => {
                  var lat2 = geocode2.data.results[0].geometry.location.lat;
                  var lng2 = geocode2.data.results[0].geometry.location.lng;
                  var coordinates2 = [ lat2, lng2 ];

                  console.log('coordinates1', coordinates1);
                  console.log('coordinates2', coordinates2);

                  // send all points
                  getLocationsAndSend(coordinates1, coordinates2, arrivalTime, transportation, io);
                  //res.send('Results found.');
                })
                .catch(err => console.log("Err getting geocode from Google API"), err);

            }
          });
        } else {
          axios.get(geocodeUrl2)
            .then((geocode2) => {
              var lat2 = geocode2.data.results[0].geometry.location.lat;
              var lng2 = geocode2.data.results[0].geometry.location.lng;
              var coordinates2 = [ lat2, lng2 ];

              console.log('coordinates1', coordinates1);
              console.log('coordinates2', coordinates2);

              getLocationsAndSend(coordinates1, coordinates2, arrivalTime, transportation, io);
              //res.send('Results found.');
            })
            .catch(err => console.log("Err getting geocode from Google API"), err);
        }
      })
      .catch(err => console.log("Err getting geocode from Google API", err));
  });

  // TODO Getting the results of the match
  // router.get('/matches', function (req, res) {
  // });

  return router;
};


module.exports = routerInstance;
