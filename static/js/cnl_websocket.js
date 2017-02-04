// Correctly decide between ws:// and wss://
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
var ws_path = ws_scheme + "://" + window.location.host + "/room/";
console.log("Connecting to " + ws_path);

var socket = new ReconnectingWebSocket(ws_path);  // Create websocket

// Helpful debugging
var cnl_connection = $(function () {
  // Socket opening
  socket.onopen = function () {
    console.log("connected websocket");
    
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);  // Get label
    
    socket.send(JSON.stringify({
      "command": "join",
      "room": room_label
    }));
  };
  
  // Socket closing
  socket:onclose = function () {
    console.log("disconnected websocket");
    
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);  // Get label
    
    socket.send(JSON.stringify({
      "command": "leave",
      "room": room_label
    }));
  };
});

var cnl_communicate = $(function () {
  socket.onmessage = function (message) {
    // Decode JSON
    console.log("[Message] " + message.data);
    var data = JSON.parse(message.data);

    //Handle errors
    if (data.error) {
      alert(data.error);
      return;
    }
    
    if (data.join) {
      // Handle joining
      console.log("Joining room " + data.join);
    } else if (data.leave) {
      //Handle Leaving
      console.log("Leaving room " + data.leave);
      data.leave.remove();
    } else if (data.rename_title) {
      // Rename room rename_title
      setRoomTitle(data.title)
    } else if (data.chat) {
      // New chat
      newChat(data);
    } else if(data.notice) {
      // New notice
      newNotice(data);
    } else if(data.new_slide) {
      cnl_slides.setNewSlide(data);
      //newSlide()
    } else if(data.msg_type) {
      // msg_types are defined in manage_room/setting.py
      switch (data.msg_type) {
        case 4:
          // Some user joined room
          console.log("Some user joined room");
          break;
        case 5:
          // Some user left room
          console.log("Some user left room");
          break;
        default:
          console.log("Unsupported message type!");
          return;
      }
    } else {
      console.log("Cannot handle message!");
    }
  };
});

var cnl_send = {
  newSlide: function() {
    room_label = window.location.pathname;
    room_label = room_label.substring(1, room_label.length-1);
    
    console.log('add clicked');
    
    socket.send(JSON.stringify({
      "command": "new_slide",
      "room": room_label
    }));
  }
}
