
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer()
  , io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var logAction = function(socket, type, data) {
  var message = {type: type, 'data': data};
  socket.emit('log', message);
  socket.broadcast.emit('log', message);
}

var places = {
  'le-vie': {
    name: "Le Vie",
    preferences: {},
  },
  'pino': {
    name: "Pino",
    preferences: {},
  },
  'roiter': {
    name: "Roiter",
    preferences: {
      flevour: 1
    },
  },
};

io.sockets.on('connection', function (socket) {
  socket.emit('update places', places);
  
  socket.on('set username', function (name) {
    socket.set('username', name, function () {
      logAction(socket, 'new-user', {subject: name});
    });
  });

  socket.on('preference', function (preference) {
    socket.get('username', function(err, username) {
      // per ogni place, rimuovi username da preferences e aggiungilo a preference
      for (place in places) {
        delete places[place].preferences[username];
      }
      places[preference].preferences[username] = 1;

      socket.emit('update places', places);
      socket.broadcast.emit('update places', places);
      logAction(socket, 'preference', {subject: preference, username: username});
    });
  });
});
