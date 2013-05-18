if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to instachat.";
  };

  Template.stream.text = function() {
    $('.chat').val();
  };

  Template.hello.events({
    'keydown' : function() {
      console.log($('.chat').val());
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
