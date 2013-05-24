// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Messages = new Meteor.Collection("messages");
Players = new Meteor.Collection("players");

Texts = new Meteor.Collection("text");


if (Meteor.isClient) {
  // Add a new record in mongo.
  // Texts.remove({});
  var idAndy = '1';
  var idMike = '2';
  Texts.insert({ _id: idAndy, text: ''});
  Texts.insert({ _id: idMike, text: ''});

  Template.hello.greeting = function () {
    return "Welcome to instachat.";
  };

  Template.streamAndy.text = function() {
    // console.log(Texts.find(Session.get("current_user")).fetch()[0]['text']);
    return Texts.find(idAndy).fetch()[0]['text'];
  };
  Template.streamMike.text = function() {
    // console.log(Texts.find(Session.get("current_user")).fetch()[0]['text']);
    return Texts.find(idMike).fetch()[0]['text'];
  };

  Template.hello.events({
    'keyup input#andy' : function() {
      var text = $('#andy').val();
      Texts.update(idAndy, {text: text});
    },
    'keyup input#mike' : function() {
      var text = $('#mike').val();
      Texts.update(idMike, {text: text});
    }
  });

  // Template.chat1.events({
  //   'keyup input.area' : function () {
  //       Players.update(Session.get("selected_player"), {$set: {"a": "hi"}});
  //   }
  // });

  // Template.display1.text = function () {
  //   return Messages.findOne({});
  // }


  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
      Session.set("current_user", this._id)

    }
  });
}

function deleteDatabase() {
  Players.remove({});
  Messages.remove({});
  Texts.remove({});
};

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    deleteDatabase();
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
