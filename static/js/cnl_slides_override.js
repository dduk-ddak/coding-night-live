// get slide with index "idx" from server
// overriden version has saving unsaved changes in curr_slide
cnl_slides.getSlideIndex_user = cnl_slides.getSlideIndex;
cnl_slides.getSlideIndex = function(idx) {
  // save changes
  if(cnl_globals.typing_timer != null) {
    clearTimeout(cnl_globals.typing_timer);
    cnl_slides.setSlideText(cnl_globals.typing_buffer);
  }

  cnl_slides.getSlideIndex_user(idx);
}

// if markdown editor's string is changed, this function is called
// socket connection if this user updates the string
cnl_slides.setSlideText_user = cnl_slides.setSlideText;
cnl_slides.setSlideText = function (str) {
  // another person may have been updated the editor string
  if(str != cnl_globals.editor.codemirror.doc.getValue()) {
    var curr_cursor = cnl_globals.editor.codemirror.doc.getCursor();
    cnl_globals.editor.codemirror.doc.setValue(str);
    cnl_globals.editor.codemirror.doc.setCursor(curr_cursor);
  }
  // this user updated
  else {
    var diff = cnl_globals.dmp.diff_main(cnl_slides.curr_slide_text, str, false);
    var patches = cnl_globals.dmp.patch_make(cnl_slides.curr_slide_text, diff);
    var patch_text = cnl_globals.dmp.patch_toText(patches);
    var pre_hash = cnl_globals.hash(cnl_slides.curr_slide_text);
    var curr_hash = cnl_globals.hash(str);

    socket.send(JSON.stringify({
      "command": "change_slide",
      "room": room_label,
      "id": cnl_slides.curr_slide_idx,
      "patch_text": patch_text,
      "pre_hash": pre_hash,
      "curr_hash": curr_hash,
    }));
  }

  cnl_slides.setSlideText_user(str);
}

// send request for new slide to server
// socket connection always
cnl_slides.getNewSlide = function () {
  socket.send(JSON.stringify({
    "command": "new_slide",
    "room": room_label
  }));
}

// callback when new slide is generated
// socket connection always
// overriden version has getSlideIndex() (if new slide is set, automatically send it to it),
// and append differently because of add button
cnl_slides.setNewSlide = function (new_idx) {
  $('#slide_list button').before('<li id="slide_' + new_idx + '" class="list-group-item" data-toggle="tooltip" data-placement="right" data-trigger="hover" title="" onclick="cnl_slides.getSlideIndex(' + new_idx + ')">Unnamed slide</li>');
  cnl_slides.getSlideIndex(new_idx);
}

// when admin clicks new slide, the info is sent for everyone(for tooltip)
// overriden version has socket send
cnl_slides.setSlideIndex_user = cnl_slides.setSlideIndex;
cnl_slides.setSlideIndex = function (data) {
  if (cnl_slides.curr_slide_idx !== data.idx) {
    socket.send(JSON.stringify({
      "command": "curr_slide",
      "room": room_label,
      "id": data.idx,
    }));
  }

  cnl_slides.setSlideIndex_user(data);
}

// send request for deleting slide with index "idx" to server
// socket connection always, two requests if no slides left
cnl_slides.getDelSlide = function (idx) {
  // called from modal
  if (typeof idx == 'undefined') {
    idx = cnl_slides.curr_slide_idx;
  }

  // If that slide was the only slide, empty this slide
  if($('#slide_list li').length === 1) {
    cnl_globals.editor.codemirror.doc.setValue('');
    cnl_slides.setSlideText('');
    cnl_slides.getRenameSlide('', idx);
  }
  else {
    socket.send(JSON.stringify({
      "command": "del_slide",
      "id": idx,
      "room": room_label
    }));
  }
}

// send request for changing slide order to server
// socket connection always
// idx is slide that is changing and it is moved before of slide with index "next"
cnl_slides.getChangeSlideOrder = function (idx, next) {
  socket.send(JSON.stringify({
    "command": "change_slide_order",
    "id": idx,
    "next_id": next,
    "room": room_label
  }));
}

// send request for renaming slide
// socket connection always
cnl_slides.getRenameSlide = function (name, idx) {
  if (typeof name == 'undefined') {
    name = $('#slide_name_input').val();
    idx = cnl_slides.curr_slide_idx;
  }
  if(name.length === 0) name = 'Unnamed slide';

  socket.send(JSON.stringify({
    "command": "rename_slide_title",
    "title": name,
    "id": idx,
    "room": room_label
  }));
}
