var cnl_rooms = {
  renameRoom: function (title) {
    // called from modal
    if(typeof title == 'undefined') {
      var title = $('#room_title_input').val();
      if(!title) console.log('?>>>>');
      if(!title) title = room_label; // default value
      socket.send(JSON.stringify({
        "command": "rename_room",
        "room": room_label,
        "title": title,
      }));
    }
    console.log(title);
    $('#room_title').text(title);
    $('#head_title').text(str + ' :: coding-night-live');
  },

  countUser: function (cnt) {
    $('#user_count').text(cnt);
  },
};
