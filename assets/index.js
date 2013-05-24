// on load of page
$(function(){
  // var socket = io.connect('http://phantachat.herokuapp.com/');
  var socket = io.connect('/test');

  // on connection to server, ask for user's name with an anonymous callback
  socket.on('connect', function(){
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    myname = prompt("What's your name?");
    socket.emit('adduser', myname);
    $("#myid").html(myname);
  });

  var maxCharacters = 80;
  var counterMultiplier = 2;
  // Some char id that we will never use.
  var unusedCounterValue = 999999999;
  var fadeMillis = 1000;
  var timeoutMillis = 3000;
  var msg = $("#msg");
  var theirlog = $("#theirlog");
  var mylog = $("#mylog");
  var myCharCounter = 0;
  var theirCharCounter = 0;

  // Focus the text box.
  msg.focus();

  // Send message on keyup.
  msg.keyup(function() {
    var message = $(this).val();
    socket.emit('sendchat', message);
    $(this).val("");
  });

  // If someone tabs away or tabs back
  var visProp = getHiddenProp();
  if (visProp) {
    var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
    document.addEventListener(evtname, function() {
      var visChange = "";
      if(isHidden())
        visChange = "visibility change: tab hidden";
      else
        visChange = "visibility change: tab visible";
      socket.emit('sendchat', visChange);
    });
  }

  // Text input box is always in focus.
  $(document).click(function() { msg.focus() });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on('updatechat', function (username, data) {
    // Determine who the chat is coming from. Then update the right place.
    // Also put the fade on each character.
    var name = $('#theirid');
    if (name == '')
      name = 'Your friend';
    if (data.indexOf("connected") == -1 && data.indexOf("visibility") == -1) {
      if (username == myname) {
        myCharCounter = getNextCharId(myCharCounter);
        appendLog(mylog, data, myCharCounter);
      } else {
        theirCharCounter = getNextCharId(theirCharCounter);
        appendLog($('#theirlog'), data, theirCharCounter);
      }
    } else if (data.indexOf("visibility change:") >= 0) {
      if ( data.indexOf("visible") == -1 && username != myname) {
        $('#theirupdate').html(name + ' either tabbed away or hasn\'t joined yet and won\'t be able to read your messages!');
        $('#theirupdate').animate({
          opacity: 1
        }, fadeMillis );
      } else {
        console.log("tabbed back");
        $('#theirupdate').animate({
          opacity: 0
        }, fadeMillis, function() {
          $(this).empty();
        });
      }
    } else if (data.indexOf("disconnected") >= 0 && username != myname) {
      $('#theirupdate').html(name + ' left the chat.');
    } else {
      console.log(data);
    }
  });

  // listener, whenever the server emits 'updateusers', this updates the username list
  socket.on('updateusers', function(data) {
    // Add the user name to the appropriate .name element.
    $.each(data, function(key, value) {
      if (key != $("#myid").text()) {
        $("#theirid").text(key);
      }
    });
  });

  function getHiddenProp() {
    var prefixes = ['webkit', 'moz', 'ms', 'o'];

    // if 'hidden' is natively supported, just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++) {
      if ((prefixes[i] + 'Hidden') in document)
        return prefixes[i] + 'Hidden';
    }
  }

  function isHidden() {
    var prop = getHiddenProp();
    if (!prop) return false;

    return document[prop];
  }

  function getNextCharId(counter) {
    return (counter + 1) % (maxCharacters * counterMultiplier);
  }

  function appendLog(log, msg, charId) {
    var d = log[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;

    // Add the fading span to the chat log.
    log.append("<span id='evaporate" + charId.toString() + "'>" + msg + "</span>");

    // Set timer to fade.
    setTimeout(function() {
      var localCharId = charId;
      $("#evaporate" + charId.toString()).animate({
        opacity: 0
      }, fadeMillis, function() {
        // Delete text if all characters have faded.
        if ((log.is($(mylog)) && localCharId == myCharCounter) ||
            (log.is($(theirlog)) && localCharId == theirCharCounter)) {
            log.empty();
        }
      });
    }, timeoutMillis);

    if (doScroll) {
      d.scrollTop = d.scrollHeight - d.clientHeight;
    }

    // Delete from char queue if there are more than max characters.
    if (log.text().length > maxCharacters) {
      $(":first-child", log).remove();
    };
    if (theirlog.text().length > maxCharacters) {
      $(":first-child", theirlog).remove();
    }
  }
});