const mongoose = require('mongoose');

var schema = mongoose.Schema;

//This schema is used to record a meeting and provide users with the results of the new meeting query
var MatchSchema = schema({
  matchId: schema.Types.ObjectId,
  userId1: String,
  userId2: String,
  midpoint: [ Number, Number ], // represented as [ latitude, longitude ]
  meetingLocations: String,
  updated: { type: Date, default: Date.now },
  matchFulfilled: Boolean
});

var Match = module.exports = mongoose.model('Match', MatchSchema);

module.exports = Match;