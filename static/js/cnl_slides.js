var cnl_slides = {
  // current showing slide index & setter
  // currently showing slide and curr_slide_idx consistency ensured
  curr_slide_idx: 0,

  getSlideIndex: function (idx) {
    if(idx === this.curr_slide_idx) {
      return;
    }

    console.log('view slide clicked');
    
    socket.send(JSON.stringify({
      "command": "get_slide",
      "room": room_label,
      "id": idx
    }));
  },

  setSlideIndex: function (data) {
    var title = data.title;
    var content = data.md_blob;
    var idx = data.idx;
    var preclicked_idx = this.curr_slide_idx;

    this.curr_slide_idx = idx;

    $('#markdown_title').text(title);
    this.setSlideText(content);

    var preclicked_slide = $('#slide_' + preclicked_idx);
    if(preclicked_slide.length !== 0) {
      preclicked_slide.removeClass('active');
    }
    $('#slide_' + idx).addClass('active');

    $('.drawer').drawer('close');
  },

  // current showing slide's text & setter
  // rendered output & curr_slide_text consistency ensured
  curr_slide_text: '',
  setSlideText: function (str) {
    this.curr_slide_text = str;
    var out = document.getElementById("out");
    out.innerHTML = cnl_globals.md.render(str);
    $('blockquote').addClass('blockquote');
  },

  // callback for change slide's content with patches
  changeSlideText: function (obj) {
    var idx = obj.id;
    var patch = obj.patch_text;
    var remote_pre_hash = obj.pre_hash;
    var remote_curr_hash = obj.curr_hash;

    if(idx === this.curr_slide_idx) {
      var local_pre_text = this.curr_slide_text;
      var local_pre_hash = cnl_globals.hash(local_pre_text);

      // Case 1: No update
      if(local_pre_hash === remote_curr_hash) return;

      // Case 2: Normal update
      else if(local_pre_hash === remote_pre_hash) {
        var patches = cnl_globals.dmp.patch_fromText(patch);
        var local_curr_text = cnl_globals.dmp.patch_apply(patches, this.curr_slide_text)[0];
        this.curr_slide_text = local_curr_text;

        console.log('LOCAL UPDATE : ' + local_curr_text);
        this.setSlideText(local_curr_text);
      }

      // Case 3: Late update
      else {
        // debug: send local_pre_hash
        // eventually, changeSlide will be called again by websocket
        // debug
      }
    }
  },

  // callback when new slide is generated
  setNewSlide: function (data) {
    var new_idx = data;
    $('#slide_list button').before('<li id="slide_' + new_idx + '" class="list-group-item drawer-menu-item" onclick="cnl_slides.getSlideIndex(' + new_idx + ')">Unnamed slide</li>');
  },

  // callback for change order of slide with index "idx" to previous of slide with index "next"
  changeSlideOrder: function (idx, next) {
    if(next !== 0) {
      $('#slide_' + idx).detach().insertBefore('#slide_' + next);
    }
    else {
      // it is last element
      $('#slide_' + idx).detach().appendTo('#slide_list');
    }
  },

  // callback for renaming slide
  renameSlide: function (idx, name) {
    if(name != $('#slide_' + idx).text()) {
      $('#slide_' + idx).text(name);
      if(idx === this.curr_slide_idx) {
        $('#markdown_title').text(name);
      }
    }
  }
};
