//middleware
var express = require('express');
var db = require('../database-mongo/index');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan');
var expressValidator = require('express-validator');
var session = require('express-session');
var app = express();
const cors = require('cors');

// Socket
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socket = require('./sockets.js')(io);

//Routes
var users = require('./users.js');
var routes = require('./routes.js')(io);

//Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
/** using jwt instead of session */
// app.use(session({
//   secret: 'secret',
//   saveUninitialized: true,
//   resave: true
// }));
require('./passport')(passport);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(morgan('combined'));

// Express Validator (displays errors when logging in)
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'), root = namespace.shift(), formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use('/', routes);
app.use('/users', users);
app.use(express.static(__dirname + '/../react-client/dist'));

// const PORT = process.env.PORT || 8080;
// const server = http.createServer(handleRequest);
// server.listen(PORT, () => {
//   console.log('Server listening on: http://localhost:%s', PORT);
// });

http.listen(3000, function(){
  console.log('socket listening on *:3000');
});
