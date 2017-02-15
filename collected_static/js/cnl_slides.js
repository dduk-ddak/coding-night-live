var cnl_slides = {
  // currently showing slide's index and curr_slide_idx consistency ensured by callback
  curr_slide_idx: 0,

  // get slide with index "idx" from server
  // this is overriden at admin to save unsaved changes in curr_slide.
  getSlideIndex: function (idx) {
    if(idx === this.curr_slide_idx) {
      return;
    }
    socket.send(JSON.stringify({
      "command": "get_slide",
      "room": room_label,
      "id": idx
    }));
  },

  // callback for getSlideIndex
  setSlideIndex: function (data) {
    var title = data.title;
    var content = data.md_blob;
    var idx = data.idx;

    if (idx !== this.curr_slide_idx) {
      var preclicked_idx = this.curr_slide_idx;
      this.curr_slide_idx = idx;

      $('#markdown_title').text(title);
      this.setSlideText(content);

      var preclicked_slide = $('#slide_' + preclicked_idx);
      if(preclicked_slide.length !== 0) {
        preclicked_slide.removeClass('active');
      }
      $('#slide_' + idx).addClass('active');
    }
  },

  // callback for getDelSlide (only admin can call getDelSlide)
  setDelSlide: function (idx) {
    var curr_slide = $('#slide_' + idx);

    if (idx === this.curr_slide_idx) {
      var next_slide = curr_slide.next();
      if(next_slide.prop('tagName') == 'BUTTON') {
        next_slide = curr_slide.prev();
      }
      var next_slide_idx = parseInt(next_slide.attr('id').split('_')[1]);
      this.getSlideIndex(next_slide_idx);
    }

    curr_slide.remove();
  },

  // current showing slide's text & setter
  // rendered output & curr_slide_text consistency ensured
  // this function is overriden for admin
  curr_slide_text: '',
  setSlideText: function (str) {
    this.curr_slide_text = str;
    var out = document.getElementById("out");
    out.innerHTML = cnl_globals.md.render(str);
    $('#out blockquote').addClass('blockquote');
    $('#out img').each(function() {
      $(this).load(mdImageResize);
    });
  },

  // callback for change slide's content with patches
  changeSlideText: function (obj) {
    if(obj.id === this.curr_slide_idx) {
      // whole text came
      if(obj.change_slide == 'whole') {
        this.curr_slide_text = obj.curr_text;
        this.setSlideText(this.curr_slide_text);
      }
      // diff came
      else if(obj.change_slide == 'diff') {
        var patch = obj.patch_text;
        var remote_pre_hash = obj.pre_hash;
        var remote_curr_hash = obj.curr_hash;
        var local_pre_text = this.curr_slide_text;
        var local_pre_hash = cnl_globals.hash(local_pre_text);

        // Case 1: No update
        if(local_pre_hash === remote_curr_hash) return;

        // Case 2: Normal update
        else if(local_pre_hash === remote_pre_hash) {
          var patches = cnl_globals.dmp.patch_fromText(patch);
          var local_curr_text = cnl_globals.dmp.patch_apply(patches, this.curr_slide_text)[0];
          this.curr_slide_text = local_curr_text;
          this.setSlideText(local_curr_text);
        }

        // Case 3: Late update
        else {
          //console.log('late update triggered')
          socket.send(JSON.stringify({
            "command": "get_slide_diff",
            "room": room_label,
            "id": obj.id,
            "hash": local_pre_hash,
            "type": "diff",
          }));
        }
      }
    }
  },

  // callback when new slide is generated
  // this function is overriden for admin
  setNewSlide: function (new_idx) {
    $('#slide_list').append('<li id="slide_' + new_idx + '" class="list-group-item" data-toggle="tooltip" data-placement="right" data-trigger="hover" title="" onclick="cnl_slides.getSlideIndex(' + new_idx + ')">Unnamed slide</li>');
  },

  // callback for change order of slide with index "idx" to previous of slide with index "next"
  setChangeSlideOrder: function (data) {
    var idx = data.id;
    var next = data.next_id;

    if (next !== 0) {
      $('#slide_' + idx).detach().insertBefore('#slide_' + next);
    }
    else {
      $('#slide_' + idx).detach().insertBefore('#slide_list button');
    }
  },

  // callback for renaming slide
  setRenameSlide: function (data) {
    var idx = data.rename_slide;
    var name = data.title;

    $('#slide_' + idx).text(name);
    if(idx == this.curr_slide_idx) {
      $('#markdown_title').text(name);
    }
  },

  // callback for current slide
  currSlide: function (idx) {
    $('#slide_list li').attr('data-original-title', '');
    $('#slide_' + idx).attr('data-original-title', 'Current Slide');
    $('#slide_' + idx).tooltip('show');
    $('#slide_list').animate({scrollTop: $('#slide_' + idx).position().top - $('#slide_list li').first().position().top}, 'slow');
    setTimeout(function() {
      $('#slide_' + idx).tooltip('hide');
    }, 1000);
  },
};
