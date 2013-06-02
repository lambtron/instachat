var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , Hashids = require('hashids');

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Listening on " + port);
});

// Configuration.
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.bodyParser());

var hashes = {};
var counter = 0;
var hashids = new Hashids("this is my salt", 8);

// routing
app.get('/', function (req, res) {
  // Create random hash.
  // Send the hash to become the socket room.
  var newHash = hashids.encrypt(counter);
  hashes[newHash] = "success";
  counter = counter + 1;
  // res.render('index.jade', {room: newHash});
  // res.redirect('http://localhost:3000/' + newHash);
  res.redirect('http://phantachat.herokuapp.com/' + newHash);
});

app.get('/:hash', function(req, res) {
  if (hashes[req.params.hash]) {
    start_chat(req.params.hash);
    res.render('index.jade', {'room': req.params.hash});
  } else {
    // create new hash.
    // Show page that says go to root to generate new chatroom.
    res.render('error.jade');
  }
});

function start_chat(namespace) {
  console.log("New namespace created: " + namespace);

  // usernames which are currently connected to the chat
  var usernames = {};

  // Uncomment the below for heroku deployment.
  io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  });

  // io.sockets.on('connection', function (socket) {

    // when the client emits 'sendnamespace', this listens and assigns namespace
    // socket.on('sendnamespace', function () {
    //   console.log("namespace: " + 'EacdMcb7');
    //   // socket.namespace = namespace;
    //   var dyn_ns = io.of('/EacdMcb7')
    //                  .on('connection', function(ns_socket){console.log('user connected to ' + last_ns.id);});
    // });

  var chat = io
    .of('/' + namespace)
    .on('connection', function (socket) {
      // when the client emits 'sendchat', this listens and executes
      socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        // io.sockets.emit('updatechat', socket.username, data);
        chat.emit('updatechat', socket.username, data);
      });

      // when the client emits 'adduser', this listens and executes
      socket.on('adduser', function(username){
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        // echo to client they've connected
        socket.emit('updatechat', 'SERVER', 'you have connected');
        // echo globally (all clients) that a person has connected
        // socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
        chat.emit('updatechat', 'SERVER', username + ' has connected');
        // update the list of users in chat, client-side
        // io.sockets.emit('updateusers', usernames);
        chat.emit('updateusers', usernames);
      });

      // when the user disconnects.. perform this
      socket.on('disconnect', function(){
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        // io.sockets.emit('updateusers', usernames);
        chat.emit('updateusers', usernames);
        // echo globally that this client has left
        // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        chat.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
      });
    });
// });
}
