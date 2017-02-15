var cnl_globals = {
  // hash function that converts string --> integer
  hash: function java_hash_conv (str) {
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },

  // markdown (rendered text area)
  md: markdownit({
    html: true,
    breaks: false,
    highlight: function (str, lang){
      // add line numbers for result
      var line_numbers = str.split('\n').length - 1;
      if(str[str.length-1] !== '\n') line_numbers += 1;
      var ret_lines = '';
      for(i=1; i<=line_numbers; i++) {
        ret_lines += '<p style="text-align:right; margin-bottom:0;">' + i + '</p>';
      }
      if(lang && hljs.getLanguage(lang)){
        try {
          // Return string **has** to be a one-liner
          return '<div><div style="width:2.5em; float:left; padding:0.5em 0.5em 0.5em 0; background-color: #f7f7f7; border-right-color: #bdbdbd;border-right-width: 1px; border-right-style: solid;">' + ret_lines + '</div><div style="margin-left:2.5em; padding:0.5em 0.5em 0.5em 1em; background-color:#fdf6e3;">' + hljs.highlight(lang, str).value + '</div></div>';
        } catch(_){}
      }
      return '<div><div style="width:2.5em; float:left; padding:0.5em 0.5em 0.5em 0; background-color: #f7f7f7; border-right-color: #bdbdbd;border-right-width: 1px; border-right-style: solid;">' + ret_lines + '</div><div style="margin-left:2.5em; padding:0.5em 0.5em 0.5em 1em; background-color:#fdf6e3;">' + str + '</div></div>';
    },
  }),

  // diff_match_patch function group
  dmp: new diff_match_patch(),

};
