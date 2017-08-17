//Models
var Meeting = require('../database-mongo/models/meeting.js');
var Match = require('../database-mongo/models/match.js');
var Chat = require('../database-mongo/models/chat.js');

//APIs
const gmaps = require('./google-maps.js');
const yelp = require('./yelp.js');

//Store active users
let users = {};


const updateUsersToClient = () => {
  // this emits our userlist as an array of usernames
  socket.emit('users', Object.keys(users));
};

var socketInstance = function(io){
  io.on('connection', function (socket) {
    console.log('a user connected', socket.id);

    socket.on('add user', (username) => {
      if (username in users) {

      } else {
        socket.username = username;
        users[socket.username] = socket;
        console.log('user online is', socket.username, '/', socket.id);
      }
    });

    socket.on('remove user', () => {
      if (socket.username) {
        console.log('user logged off:', socket.username, '/', socket.id);
        delete users[socket.username];
        socket.username = null;
        console.log('users is', Object.keys(users));
      }
    });


    // Server is listening to 'user looking' from client. then creates a new room which is joined
    socket.on('user looking for friend', function (meeting) {
      // Room set-up (rooms are naively set as sorted and joined names e.g. 'alicebob')
      var sortedPair = [meeting.friendId, meeting.userId].sort();
      var matchRoom = sortedPair.join('-');

      // set socket's username property
      socket.username = meeting.userId;

      socket.join(matchRoom, function() {
        console.log('hit Join, now looking & room joined is ---->', matchRoom);

        // Emit only to the room where you are at, to notify that you(rself) are looking
        socket.to(matchRoom).emit('match status', { statusMessage: 'Looking for your friend...'});

        // search database Meeting table to find a meeting where the userID is YOUR FRIEND, 
        // and the friendID is YOURSELF (which means your friend is also looking)
        Meeting.findOne({userId: meeting.friendId, friendId: meeting.userId})
          .exec(function (err, doc) {
            if (err) return console.error('Err querying Meeting table for userId and friendId: ', err);
            
            if (doc) {
              console.log('Found a match in Meeting DB, matched FriendDoc:', doc);
              
              socket.emit('match status', {
                statusMessage: 'Your match was found!',
                matchRoom: matchRoom
              });
              socket.to(matchRoom).emit('match status', {
                statusMessage: 'Your match was found!',
                matchRoom: matchRoom
              });

              // TODO: the Match is found, create instance to save to db
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

                  gmaps.generatePointsAlong(userLocation.coordinates, friendLocation.coordinates)
                    .then(({ pointsAlong, midpoint }) => {
                      // Generate midpoint locations with higher search radius
                      yelp.yelpRequest(midpoint, 10)
                        .then((yelpLocations) => {
                          io.sockets.emit('midpoint', { lat: midpoint.latitude, lng: midpoint.longitude });
                          io.sockets.emit('mid meeting locations', yelpLocations);
                          // formatted as { location1: [lat,lng], location2: [lat, lng] }
                          io.sockets.emit('user locations', {
                            location1: { lat: userLocation.coordinates[0], lng: userLocation.coordinates[1] },
                            location2: { lat: friendLocation.coordinates[0], lng: friendLocation.coordinates[1] },
                          });
                        });
                      const mappedYelp = pointsAlong.map((point) => {
                        
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

                  // gmaps.generateMidpoint(userLocation.coordinates, friendLocation.coordinates)
                  //   .then((midpoint) => {
                  //     console.log('Midpoint generated:', midpoint);

                  //     yelp.yelpRequest(midpoint)
                  //       .then((yelpLocations) => {
                  //         // Re-render client

                  //         // push to the beginning of yelpLocations
                  //         // var md = { coordinates: midpoint };
                  //         // yelpLocations.unshift(md);
                  //         io.sockets.emit('midpoint', { lat: midpoint.latitude, lng: midpoint.longitude });
                  //         io.sockets.emit('mid meeting locations', yelpLocations);
                  //         io.sockets.emit('user locations', {
                  //           location1: { lat: userLocation.coordinates[0], lng: userLocation.coordinates[1] },
                  //           location2: { lat: friendLocation.coordinates[0], lng: friendLocation.coordinates[1] }
                  //         })
                  //       });
                  //   });
                });

            } else {
              console.log(`User ${meeting.friendId} and Friend ${meeting.userId} match not found in db.`);

              console.log('room', matchRoom);
              socket.to(matchRoom).emit('match status', {
                statusMessage: 'Looking for your friend.',
                matchRoom: matchRoom
              });
            }
          }); // End meeting.findOne


          // Set up additional socket listening for particular matchRoom

          socket.on(matchRoom, function(chatData) {
            console.log('Chat msg gotten on server:', chatData, 'on matchroom', matchRoom);

            // get the toUser and fromUser from the matchRoom name
            var names = matchRoom.split('-');
            var fromUserIndex = names.indexOf(chatData.username);
            var toUserIndex = fromUserIndex === 0 ? 1 : 0;
            var toUsername = names[toUserIndex];

            var newChatMsg = new Chat({
              toUser: toUsername,
              fromUser: chatData.username,
              msg: chatData.message
            });

            // Save chat on db
            Chat.createChatMessage(newChatMsg, (err, savedMsg) => {
              if (err) { 
                console.log('ERROR saving chatMsg to DB', err);
              } else {
                console.log('Saved chatMsg to db ->', savedMsg);
              }

            });

            // Broadcast chat to this room only to all users including sender
            io.sockets.in(matchRoom).emit('chat', chatData);
          });

      }); // End socket.join room
    }); // End socket on

    socket.on('disconnect', function () {
      // TODO update socket_id db
      console.log('a user disconnected', socket.id);
      if (socket.username) {
        console.log('user logged off:', socket.username, '/', socket.id);
        delete users[socket.username];
      }
      // updateUsersToClient();
    });
  });
};

module.exports = socketInstance;
