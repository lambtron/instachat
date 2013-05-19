Texts = new Meteor.Collection("text");

if (Meteor.isClient) {
  // Add a new record in mongo.
  // Texts.remove({});
  var idAndy = Texts.insert({text: ''});
  var idMike = Texts.insert({text: ''});
  Session.set("current_user", idAndy);

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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Texts.remove({});
  });
}