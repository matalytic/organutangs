//Models
var Meeting = require('../database-mongo/models/meeting.js');
var Match = require('../database-mongo/models/match.js');

//APIs
const gmaps = require('./google-maps.js');
const yelp = require('./yelp.js');

var socketInstance = function(io){
  io.on('connection', function (socket) {
    console.log('a user connected', socket.id);

    // Set up socket for chat
    
    socket.on('chat', function(data) {
      console.log('Chat msg gotten on server:', data);

    });

    // Socket set up for match

    socket.on('user looking for friend', function (meeting) {
      // Room set-up (rooms are naively set as sorted and joined names e.g. 'alicebob')
      var sortedPair = [meeting.friendId, meeting.userId].sort();
      var room = sortedPair.join('');

      socket.join(room, function() {
        console.log('room joined ---->', room);

        // emit this globally to listen to match...
        socket.emit('match status', 'Looking for your friend...');

        // emit only to the room where you are at, to notify that you(rself) are looking
        socket.to(room).emit('match status', 'Looking for your friend...');

        // search database Meeting table to find a meeting where the userID is YOUR FRIEND, 
        // and the friendID is YOURSELF (which means your friend is also looking)
        Meeting.findOne({userId: meeting.friendId, friendId: meeting.userId})
          .exec(function (err, doc) {
            if (err) return console.error('Err querying Meeting table for userId and friendId: ', err);
            
            // think of 'doc' as the FRIENDMeetingDoc
            if (doc) {
              // Match found! Insert match into the db.
              // socket.broadcast.emit('match status', 'found');
              console.log('Found a match');
              console.log('socket.rooms', socket.rooms);
              socket.emit('match status', 'Your match was found!');
              socket.to(room).emit('match status', 'Your match was found!');

              // the Match db entity is created here but not saved to db
              var newMatch = new Match({
                userId1: meeting.userId,
                userId2: meeting.friendId,
                matchFulfilled: true
              });

              // Get location 1
              var friendLocation = doc.userLocation;

              // Get location 2
              // - Pull the friend's geocoded location from db
              Meeting.findOne({userId: meeting.userId})
                .exec(function (err, doc) {
                  var userLocation = doc.userLocation;

                  gmaps.generateMidpoint(userLocation.coordinates, friendLocation.coordinates)
                    .then((midpoint) => {
                      console.log('Midpoint generated:', midpoint);

                      yelp.yelpRequest(midpoint)
                        .then((yelpLocations) => {
                          // Re-render client

                          // push to the beginning of yelpLocations
                          // var md = { coordinates: midpoint };
                          // yelpLocations.unshift(md);
                          io.sockets.emit('midpoint', { lat: midpoint.latitude, lng: midpoint.longitude });
                          io.sockets.emit('meeting locations', yelpLocations);
                          io.sockets.emit('user locations', {
                            location1: { lat: userLocation.coordinates[0], lng: userLocation.coordinates[1] },
                            location2: { lat: friendLocation.coordinates[0], lng: friendLocation.coordinates[1] }
                          })
                        });
                    });
                });

            } else {
              console.log(`User ${meeting.friendId} and Friend ${meeting.userId} match not found in db.`);
              // TODO somehow print "Looking for your friend"
              console.log('room', room);
              socket.to(room).emit('match status', 'Looking for your friend.');
            }
          }); // End meeting.findOne
      }); // End socket.join room
    }); // End socket on

    socket.on('disconnect', function () {
      // TODO update socket_id db
      console.log('a user disconnected');
    });
  });
};

module.exports = socketInstance;
