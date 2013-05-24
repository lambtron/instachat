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
  console.log(hashes);
  console.log(hashes[newHash]);
  // res.render('index.jade', {room: newHash});
  res.redirect('http://localhost:3000/' + newHash);
  // res.redirect('http://phantachat.herokuapp.com/' + newHash);
});

app.get('/:hash', function(req, res) {
  if (hashes[req.params.hash]) {
    res.render('index.jade', {room: req.params.hash});
  } else {
    // create new hash.
    // Show page that says go to root to generate new chatroom.
    res.render('error.jade')
  }
});

// routing with hashes.
// var hashes = {}
// app.get('/:hash', function(req,res){
//   if (hashes[req.params.hash]){ // route that shit
//     res.sendfile(__dirname + '/index.html'); // hash?
//   } else {
//     // create new hash here and shit
//   }
// });

// usernames which are currently connected to the chat
var usernames = {};

// io.configure(function() {
//   io.set("transports", ["xhr-polling"]);
//   io.set("polling duration", 10);
// });

// var chat = io
//   .of('/test')
//   .on('connection', function (socket) {
//     // when the client emits 'sendchat', this listens and executes
//     socket.on('sendchat', function (data) {
//       // we tell the client to execute 'updatechat' with 2 parameters
//       io.sockets.emit('updatechat', socket.username, data);
//     });

//     // when the client emits 'adduser', this listens and executes
//     socket.on('adduser', function(username){
//       // we store the username in the socket session for this client
//       socket.username = username;
//       // add the client's username to the global list
//       usernames[username] = username;
//       // echo to client they've connected
//       socket.emit('updatechat', 'SERVER', 'you have connected');
//       // echo globally (all clients) that a person has connected
//       socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
//       // update the list of users in chat, client-side
//       io.sockets.emit('updateusers', usernames);
//     });

//     // when the user disconnects.. perform this
//     socket.on('disconnect', function(){
//       // remove the username from global usernames list
//       delete usernames[socket.username];
//       // update list of users in chat, client-side
//       io.sockets.emit('updateusers', usernames);
//       // echo globally that this client has left
//       socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
//     });
//   });

io.sockets.on('connection', function (socket) {

  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    io.sockets.emit('updatechat', socket.username, data);
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
    socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
    // update the list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});