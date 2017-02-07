// Correctly decide between ws:// and wss://
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
var ws_path = ws_scheme + "://" + window.location.host + "/room/";
console.log("Connecting to " + ws_path);

var socket = new ReconnectingWebSocket(ws_path);  // Create websocket
var room_label = window.location.pathname;
room_label = room_label.substring(1, room_label.length-1);  // Get label

// Socket opening
socket.onopen = function () {
  console.log("connected websocket");

  socket.send(JSON.stringify({
    "command": "join",
    "room": room_label
  }));

  // markdown view init
  var first_slide_idx = parseInt($('#slide_list li:nth-child(1)').attr('id').split('_')[1]);
  console.log(first_slide_idx);
  cnl_slides.getSlideIndex(first_slide_idx);
};

// Socket(Browser) closing
socket.onclose = window.onbeforeunload = function () {
  console.log("disconnected websocket");

  socket.send(JSON.stringify({
    "command": "leave",
    "room": room_label
  }));
};

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
    cnl_chats.newChat(data);
  } else if (data.notice) {
    // New notice
    newNotice(data);
  } else if (data.new_slide) {
    // New Slide
    cnl_slides.setNewSlide(data.new_slide);
  } else if (data.del_slide) {
    // Delete Slide
    cnl_slides.setDelSlide(data.del_slide);
  } else if (data.get_slide) {
    cnl_slides.setSlideIndex(data);
    //data.md_blob
  } else if (data.rename_slide) {
    cnl_slides.setRenameSlide(data);
  } else if (data.change_slide_order) {
    cnl_slides.setChangeSlideOrder(data);
  } else if (data.change_slide) {
    cnl_slides.changeSlideText(data);
  } else if (data.rename_room) {
    cnl_rooms.renameRoom(data.rename_room);
  } else if (data.count_user) {
    cnl_rooms.countUser(data.count_user);
  } else if (data.msg_type) {
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
