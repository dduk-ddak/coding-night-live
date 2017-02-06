var cnl_chats = {
  valid_syntax: {
      help: "@help",
      reply: "@reply <hash_value> <comment>",
      chat: "<comment>",
  },

  operationEnum: {
    help: 0,
    reply: 1,
    chat: 2,
    typo: 3,
  },

  classifyOperation: function (command) {
    var operation_idx;

    if(this.isValidHelpSyntax(command)) {
      operation_idx = this.operationEnum.help;
    } else if(this.isValidReplySyntax(command)) {
      operation_idx = this.operationEnum.reply;
    } else if(this.isPossibleTypo(command)) {
      operation_idx = this.operationEnum.typo;
    } else {
      operation_idx = this.operationEnum.chat;
    }

    return operation_idx;
  },

  getAutocompletion: function (command, matches) {
    matches = this.getHelpAutocompletion(command, matches);
    matches = this.getReplyAutocompletion(command, matches);

    return matches;
  },

  getHelpAutocompletion: function(command, matches) {
    command = command.trim();
    var len = command.length,
        upper_bound = 5, // length of '@help'
        is_valid = false,
        text = "@help";

    var help_regex = [
        /@/g, /@h/g, /@he/g,
        /@hel/g, /@help/g,
        /^(\s)*@help\s*$/g,
    ];
    if(len <= upper_bound) {
      // user is still typing the command;
      // check for partial syntax.
      is_valid = !!command.match(help_regex[len-1]);
    } else {
      // check for full systax
      is_valid = !!command.match(help_regex[upper_bound]);
    }

    if(is_valid === true) {
      matches = matches.concat([{label: this.valid_syntax.help,
                                 value: text}]);
    }
    return matches;
  },

  getReplyAutocompletion: function(command, matches) {
    command = command.trim();
    var len = command.length,
        upper_bound = 6, // length of '@reply'
        is_valid = false,
        text = "@reply ";

    var reply_regex = [
        /^@/g, /^@r/g, /^@re/g,
        /^@rep/g, /^@repl/g,
        /^@reply\s*/g, /^\s*@reply\s*(?=\d)/g,];

    var label = "@reply ", labels = [], texts = [];

    if(len <= upper_bound) {
      // user is still typing the command;
      // check for partial syntax.
      if(!!command.match(reply_regex[len-1])) {
        matches = matches.concat([{label: this.valid_syntax.reply,
                                   value: text}]);
        return matches;
      }
    } else {
      // check for full systax
      // first character after @reply must be a digit
      if(!!!command.match(/^\s*@reply\s*(?=[\d])/g))
        return matches;
      // remove '@reply '
      command = command.replace(/^(\s)*@reply\s*/g, "");

      if(command.search(/^\d+(?!\w)/g) === -1) {
        // invalid user-given hash value
        return matches;
      }

      var hash = command.match(/^\d+(?!\w)/g)[0];
      command = command.replace(/^\d+(?!\w)/g, "");

      var is_valid_hash = false, is_complete_hash = false;
      var partial_hash_regex, complete_hash_regex;

      for(var i=0; i<cnl_chats.chatHashList.length; i+=1) {
        partial_hash_regex = new RegExp("^"+hash, "g");
        complete_hash_regex = new RegExp("^"+hash+"$", "g");

        if(!!cnl_chats.chatHashList[i].match(complete_hash_regex)) {
          text += hash + " ";
          label += hash + " <comment>";
          is_complete_hash = true;
          break;
        } else if(!!cnl_chats.chatHashList[i].match(partial_hash_regex))
        {
          labels.push(text + cnl_chats.chatHashList[i] + " <comment>");
          texts.push(text + cnl_chats.chatHashList[i] + " ");
          is_valid_hash = true;
        }
      }

      if(command.length === 0) {
        if (is_complete_hash) {
          matches = matches.concat([{label: label,
                                     value: text}]);
        } else if (is_valid_hash) {
          for(var i=0; i<cnl_chats.chatHashList.length; i+=1)
            matches = matches.concat([{label: labels[i],
                                       value: texts[i]}]);
        }
        return matches;
      }

      if(is_complete_hash) {
        matches = matches.concat([{label: label,
                                   value: text}]);
        return matches;
      }
    }
    return matches;
  },

  isValidHelpSyntax: function(command) {
    var is_valid = false;
    var help_regex = [/^\s*@help\s*$/g];

    is_valid = !!command.match(help_regex[0]);
    return is_valid;
  },

  isValidReplySyntax: function(command) {
    var is_valid = false,
        hash = "",
        comment = "";

    command = command.trim();

    // starts with '@reply '
    if(!!!command.match(/^\s*@reply\s+/g)) {
      // console.log("doesn't start with '@reply '");
      return is_valid;
    }
    command = command.replace(/^\s*@reply\s+/g, "");

    if(!!!command.match(/^\d+(?!\w)/g))
      return is_valid;

    hash = command.match(/^\d+(?!\w)/g)[0];
    command = command.replace(/^\d+(?!\w)/g, "");

    var is_valid_hash = false,
        complete_hash_regex;

    for(var i=0; i<cnl_chats.chatHashList.length; i+=1) {
      complete_hash_regex = new RegExp("^"+hash+"$", "g");
      if(!!cnl_chats.chatHashList[i].match(complete_hash_regex)) {
        is_valid_hash = true;
        break;
      }
    }

    if(!is_valid_hash){
      // invalid hash value given
      // console.log("invalid hash");
      return is_valid;
    }

    if(command.length === 0){
      // empty comment
      // console.log("empty comment");
      return is_valid;
    }
    else {
      is_valid = true;
    }

    return is_valid;
  },

  isPossibleTypo: function(command) {
    var is_valid = false;
    var typo_regex = [/^\s*(?=@)/g];

    is_valid = !!command.match(typo_regex[0]);

    return is_valid;
  },

  helpWrapper: function(command) {

    console.log(cnl_chats.valid_syntax);
  },

  getDateString: function() {
    var date = new Date();
    var year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDay(),
        hour = date.getHours(),
        min = date.getMinutes();
    var date_string = String(year) +'.'  +
                      String(month)+'.'  +
                      String(day)  +'. ' +
                      String(hour) +':'  +
                      String(min);

    return date_string;
  },

  chatWrapper: function(command) {
    var obj = {hash_value: '', time: '', description: '', is_reply: false};
    var hash_value = cnl_globals.hash(command),
        date_string = cnl_chats.getDateString();

    if(hash_value < 0)
      hash_value = hash_value * -1;

    obj.hash_value = hash_value;
    obj.time = date_string;
    obj.description = command;

    cnl_chats.chatHashList.push(String(obj.hash_value));

    cnl_chats.newChat(obj);
  },

  replyWrapper: function(command) {
    var obj = {hash_value: '', time: '', description: '', is_reply: true};
    var hash_value,
        description,
        date_string = cnl_chats.getDateString();

    command = command.trim();

    // remove with '@reply '
    command = command.replace(/^\s*@reply\s+/g, "");

    hash_value = command.match(/^\d+(?!\w)/g)[0];
    command = command.replace(/^\d+\s*(?!\w)/g, "");
    description = command;

    obj.hash_value = hash_value;
    obj.time = date_string;
    obj.description = description;

    cnl_chats.newChat(obj);
  },

  showTypoAlertMessage: function(command) {
    command = "'" + command + "'";
    console.log(command, "is not a valid command. " +
    "See '@help' for the list of available commands.");
  },

  newChat: function(obj) {
    var is_end_of_scroll = $('#chat_list_scroll').scrollTop() === $('#chat_list_scroll')[0].scrollHeight - $('#chat_list_scroll').height();
    var appended_elem = 0;
    if(obj.is_reply) {
      appended_elem = $('\
          <div style="float: left; width: 30px; margin-top: 10px;"><i class="fa fa-reply" aria-hidden="true"></i></div>\
          <div class="card" style="margin-left:30px;">\
          <div class="card-block">\
          <p class="card-text">' + obj.description + '</p>\
          </div>\
          </div>');
      $('#chat_list_items').find('#chat_' + obj.hash_value).append(appended_elem);
    }
    else {
      appended_elem = $('\
          <div id="chat_' + obj.hash_value + '">\
          <div class="card">\
          <div class="card-header" style="padding-left: .5rem;">\
          <div style="float:left; margin-right: 10px;"><i class="fa fa-commenting-o" aria-hidden="true"></i> ' + obj.hash_value + '</div> <div style="margin:0;font-size:.5em;" align="right">' + obj.time + '</div>\
          </div>\
          <div class="card-block">\
          <p class="card-text">' + obj.description + '</p>\
          </div>\
          </div>');
      $('#chat_list_items').append(appended_elem);
    }
    if(is_end_of_scroll) {
      $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'slow');
    }
    else {
      if($('#chat_scroll_button').css('visibility') == 'hidden') {
        toBeScrolledPosition(appended_elem.position().top);
        $('#chat_scroll_button').css('visibility', 'visible');
      }
    }
  },
};

cnl_chats.chatHashList = [];

cnl_chats.operationTable = [
  cnl_chats.helpWrapper,
  cnl_chats.replyWrapper,
  cnl_chats.chatWrapper,
  cnl_chats.showTypoAlertMessage,
];
