var mongoose = require('mongoose');

mongoose.connect('mongodb://halfwaze:halfwaze@ds151153.mlab.com:51153/halfwaze', {useMongoClient: true});
var db = mongoose.connection;

var connectIntervalId;

db.on('error', () => {
  console.log('mongoose connection error, retrying in 5 seconds');

  connectIntervalId = setTimeout(() => {
    connect();
  }, 5000);

  db.close();
});

db.once('open', () => {
  console.log('mongoose connected successfully');
  clearTimeout(connectIntervalId);
});

function connect() {
  mongoose.connect('mongodb://halfwaze:halfwaze@ds151153.mlab.com:51153/halfwaze', {useMongoClient: true});
  db = mongoose.connection;
}

module.exports = db;
