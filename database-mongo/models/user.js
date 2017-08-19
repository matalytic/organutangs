var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// User Schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
    required: true
  },
  password: {
    type: String
  },
  savedLocations: {
    type: Object,
    default: {'test': 'text'}
  },
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          newUser.password = hash;
          newUser.save(callback(err, newUser));
          console.log("THIS IS THE HASH ", hash);
          console.log("what is save ", newUser);
      });
  });
};

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
};

module.exports.saveLocation = function(username, newLocation, callback){
  var query = { username: username };
  var id = newLocation.id;
  var path = `savedLocations.${id}`;
  var update = {};
  update[path] = newLocation;
  var newLocation = { "$set": update };
  // console.log('new location obj', newLocation);
  User.findOneAndUpdate(query, newLocation, callback);
}

module.exports.removeSavedLocation = function(username, location, callback){
  var query = { username: username };
  var id = location;
  var path = `savedLocations.${id}`;
  var update = {};
  update[path] = "";
  console.log('update obj', update);
  var removedLocation = { "$unset": update };
  // console.log('new location obj', newLocation);
  User.findOneAndUpdate(query, removedLocation, callback);
}