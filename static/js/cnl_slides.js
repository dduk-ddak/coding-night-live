var cnl_slides = {
  // current showing slide index & setter
  // currently showing slide and curr_slide_idx consistency ensured
  curr_slide_idx: 0,
  setSlideIndex: function(idx) {
    if(idx === this.curr_slide_idx) {
      return;
    }

    // debug: do something with idx and get data
    console.log('setSlideIndex');
    console.log(idx);
    var title = 'this is title of idx ' + idx.toString();
    var content = '# this is title with idx ' + idx.toString() + '\n## and this is content!\n### this too!';
    // debug: end

    $('#markdown_title').text(title);
    this.setSlideText(content);

    var preclicked_slide = $('#slide_' + this.curr_slide_idx);
    if(preclicked_slide.length !== 0) {
      preclicked_slide.removeClass('active');
    }
    $('#slide_' + idx.toString()).addClass('active');

    $('.drawer').drawer('close');

    // update curr_slide_idx here. we have to use the previous value.
    this.curr_slide_idx = idx;
  },

  // current showing slide's text & setter
  // rendered output & curr_slide_text consistency ensured
  curr_slide_text: '',
  setSlideText: function(str) {
    this.curr_slide_text = str;
    var out = document.getElementById("out");
    out.innerHTML = cnl_globals.md.render(str);
    $('blockquote').addClass('blockquote');
  },

  // change slide's content with patches
  changeSlideText: function(idx, patch, remote_pre_hash, remote_curr_hash) {
    if(idx === curr_slide_idx) {
      var local_pre_text = this.curr_slide_text;
      var local_pre_hash = cnl_globals.hash(local_pre_text);

      // Case 1: No update
      if(local_pre_hash === remote_curr_hash) return;

      // Case 2: Normal update
      else if(local_pre_hash === remote_pre_hash) {
        var patches = cnl_globals.dmp.patch_fromText(patch);
        var local_curr_text = cnl_globals.dmp.patch_apply(patches, pre_text);
        this.curr_slide_text = local_curr_text;
      }

      // Case 3: Late update
      else {
        // debug: send local_pre_hash
        // eventually, changeSlide will be called again by websocket
        // debug
      }
    }
  },

  // change order of slide with index "idx" to previous of slide with index "next"
  changeSlideOrder: function(idx, next) {
    if(next !== 0) {
      $('#slide_' + idx).detach().insertBefore('#slide_' + next);
    }
    else {
      // it is last element
      $('#slide_' + idx).detach().appendTo('#slide_list');
    }
  },

  // renaming slide
  renameSlide: function(idx, name) {
    if(name != $('#slide_' + idx).text()) {
      $('#slide_' + idx).text(name);
      if(idx === this.curr_slide_idx) {
        $('#markdown_title').text(name);
      }
    }
  }
};
