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