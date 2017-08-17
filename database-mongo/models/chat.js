const mongoose = require('mongoose');

var ChatSchema = mongoose.Schema({
  toUser: { 
    type: String,
    ref: 'User',
    required: true
  },
  fromUser: { 
    type: String,
    ref: 'User',
    required: true 
  },
  msg: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date,
    default: Date.now()
  }
});


var Chat = module.exports = mongoose.model('Chat', ChatSchema);

module.exports.createChatMessage = function(newChatMessage, callback) {
  newChatMessage.save(function(err, savedDoc) {
    if (err) {
      callback(err, null);
    }
    if (savedDoc) {
      callback(null, savedDoc);
    }
  });
};

module.exports.getMostRecent = function(user1, user2, numberOfRecent = 5, callback) {
  Chat.find({
    $or: [
      { $and: [{ toUser: user1}, {fromUser: user2}] },
      { $and: [{ toUser: user2}, {fromUser: user1}] }
    ]
  }).limit(10).sort({timestamp: -1}).exec(function(err, results){
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}