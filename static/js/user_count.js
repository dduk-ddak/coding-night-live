$(function() {
  var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
  var ws_path = ws_scheme + '://' + window.location.host + "/room/user_count/";
  console.log("Connecting to " + ws_path);
  var socket = new ReconnectingWebSocket(ws_path);  // Create websocket
  
  socket.onmessage = function (message) {
    //Decode the JSON
    console.log("Got websocket message " + message.data);
    var data = JSON.parse(message.data);
    
    // Handle errors
    if (data.error) {
      alert(data.error);
      return;
    }
    // Handle joining
    if (data.join) {
      console.log("Joining room " + data.join);
      // Handle leaving
    } else if (data.leave) {
      console.log("Leaving room " + data.leave);
      data.leave.remove();
      // Handle getting a message
    } else if (data.msg_type != 0) {
      // msg types are defined in manage_room/setting.py
      switch (data.msg_type) {
        case 4:
          // User joined room
          console.log("some user joined room");
          break;
        case 5:
          // User left room
          console.log("some user left room");
          break;
        default:
          console.log("Unsupported message type!");
          return;
      }
    } else {
      console.log("Cannot handle message!");
    }
  };
  
  // Helpful debugging
  socket.onopen = function () {
    console.log("connected websocket");
    
    room_label = window.loacation.pathname;
    room_label = room_label.substring(1, room_label.length-1);  // Get Label
    
    socket.send(JSON.stringify({
      "command": "join",
      "room": room_label
    }));
  
  socket.onclose = function () {
    console.log("disconnected websocket");
    
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);

    socket.send(JSON.stringify({
      "command": "leave",
      "room": room_label
    }));
  };
});
