$(function () {
  // Correctly decide between ws:// and wss://
  var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
  var ws_path = ws_scheme + '://' + window.location.host + "/talk/";
  console.log("Connecting to " + ws_path);
  var socket = new ReconnectingWebSocket(ws_path);  // Create websocket

  socket.onmessage = function (message) {
    // Decode the JSON
    console.log("Got websocket message " + message.data);
    var data = JSON.parse(message.data);
    
    // Handle errors
    if (data.error) {
      alert(data.error);
      return;
    }

    // Handle joining
    if (data.join) {
      console.log("Joining talk " + data.join);
      // Handle Leaving
    } else if (data.leave) {
      console.log("Leaving talk " + data.leave);
      data.leave.remove();
      // Handle getting a message
    } else if (data.chat) {
        console.log("Chat : " + data.chat);
    } else if (data.notice) {
        console.log("Notice : " + data.notice);
    } else {
      console.log("Cannot handle message!");
    }
  };

  // notice sending test
  $("#send-btn").click(function () {
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);
    
    socket.send(JSON.stringify({
        "command": "notice",
        "description": $("#chat_input").val(),
        "room": room_label
    }))
  });
  
  // Helpful debugging
  socket.onopen = function () {
    console.log("connected websocket - chat");
    
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);  //get label
    
    socket.send(JSON.stringify({
      "command": "join",
      "room": room_label
    }));
  };
  
  socket.onclose = function () {
    console.log("disconnected websocket - chat");
    
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);  //get label
    
    socket.send(JSON.stringify({
      "command": "leave",
      "room": room_label
    }));
  };
});
