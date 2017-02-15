// Correctly decide between ws:// and wss://
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
var ws_path = ws_scheme + "://" + window.location.host + "/room/";
//console.log("Connecting to " + ws_path);

var socket = new ReconnectingWebSocket(ws_path);  // Create websocket
var room_label = window.location.pathname;
room_label = room_label.substring(1, room_label.length-1);  // Get label
google.charts.load('current', {'packages':['corechart']});  // Load the Visualization API and the piechart package.

var had_count = false;

// Socket opening
socket.onopen = function () {
  //console.log("connected websocket");

  if(had_count === false) {
    socket.send(JSON.stringify({
      "command": "join",
      "room": room_label
    }));
    had_count = true;
  }

  // markdown view init
  var first_slide_idx = parseInt($('#slide_list li:nth-child(1)').attr('id').split('_')[1]);
  cnl_slides.getSlideIndex(first_slide_idx);
};

// Browser reloading
window.onpageshow = function(e) {
  // if page is cached, reload for socket refresh
  if (e.persisted) {
    window.location.reload();
  }
}

// Browser closing
window.onbeforeunload = function () {
  // console.log("disconnected websocket");

  socket.send(JSON.stringify({
    "command": "leave",
    "room": room_label
  }));
};

socket.onmessage = function (message) {
  // Decode JSON
  // console.log("[Message] " + message.data);
  var data = JSON.parse(message.data);

  // Handle errors: does nothing afterwards
  if (data.error) {
    if (data.error == 'ROOM_INVALID') {
      // redirect to home
      alert("Admin has deleted this room.");
      window.location.replace(window.location.protocol + "//" + window.location.host);
      socket = 0;
    } else if (data.error == "CANNOT_DELETE_LAST") {
      alert("The last one cannot be deleted!");
    }
    else {
      alert(data.error);
    }
    return;
  }

  if (data.chat) {
    // New chat
    cnl_chats.newChat(data);
  } else if (data.notice) {
    // New notice
    cnl_chats.newNotice(data);
  } else if (data.start_poll) {
    // Start poll
    cnl_chats.startPoll(data);
  } else if (data.result_poll) {
    // Result poll
    cnl_chats.resultPoll(data);
  } else if (data.new_slide) {
    // New Slide
    cnl_slides.setNewSlide(data.new_slide);
  } else if (data.del_slide) {
    // Delete Slide
    cnl_slides.setDelSlide(data.del_slide);
  } else if (data.get_slide) {
    // View selected slide
    cnl_slides.setSlideIndex(data);
  } else if (data.rename_slide) {
    // Rename slide title
    cnl_slides.setRenameSlide(data);
  } else if (data.change_slide_order) {
    // Change slide order
    cnl_slides.setChangeSlideOrder(data);
  } else if (data.change_slide) {
    // Edit slide contents
    cnl_slides.changeSlideText(data);
  } else if (data.rename_room) {
    // Rename room title
    cnl_rooms.renameRoom(data.rename_room);
  } else if (data.count_user) {
    // Count connected user
    cnl_rooms.countUser(data.count_user);
  } else if (data.curr_slide) {
    // notice users for current slide that admin is watching
    cnl_slides.currSlide(data.curr_slide);
  } else {
    //console.log("Cannot handle message!");
  }
};
