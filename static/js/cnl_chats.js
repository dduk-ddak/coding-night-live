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

    if (this.isValidHelpSyntax(command)) {
      operation_idx = this.operationEnum.help;
    } else if (this.isValidReplySyntax(command)) {
      operation_idx = this.operationEnum.reply;
    } else if (this.isPossibleTypo(command)) {
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

  getHelpAutocompletion: function (command, matches) {
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
    if (len <= upper_bound) {
      // user is still typing the command;
      // check for partial syntax.
      is_valid = !!command.match(help_regex[len-1]);
    } else {
      // check for full systax
      is_valid = !!command.match(help_regex[upper_bound]);
    }

    if (is_valid === true) {
      matches = matches.concat([{label: this.valid_syntax.help,
                                 value: text}]);
    }
    return matches;
  },

  getReplyAutocompletion: function (command, matches) {
    // remove leading white spaces
    command = command.replace(/^\s*/g, "");

    var len = command.trim().length,
        upper_bound = 6, // length of '@reply'
        is_valid = false,
        text = "@reply #";

    var reply_regex = [
        /^@/g, /^@r/g, /^@re/g,
        /^@rep/g, /^@repl/g,
        /^@reply\s*/g, /^\s*@reply\s*(?=\d)/g,];

    var label = "@reply #", labels = [], texts = [];

    if (len <= upper_bound) {
      // user is still typing the command;
      // check for partial syntax.
      if (!!command.match(reply_regex[len-1])) {
        matches = matches.concat([{label: this.valid_syntax.reply,
                                   value: text}]);
        return matches;
      }
    } else {
      // check for full systax
      // first character after @reply must be a digit
      if (!!!command.match(/^\s*@reply\s*(?=[#])/g))
        return matches;
      // remove '@reply '
      command = command.replace(/^(\s)*@reply\s*#/g, "");

      if (command.search(/^[0-9a-z]*(?![^\s])/g) === -1) {
        // invalid user-given hash value
        return matches;
      }

      var hash = command.match(/^[0-9a-z]*(?![^\s])/g)[0];
      command = command.replace(/^[0-9a-z]*(?![^\s])\s*/g, "");

      var is_valid_hash = false, is_complete_hash = false;
      var partial_hash_regex, complete_hash_regex;

      for (var i=0; i<cnl_chats.chatHashList.length; i+=1) {
        partial_hash_regex = new RegExp("^"+hash, "g");
        complete_hash_regex = new RegExp("^"+hash+"$", "g");

        if (cnl_chats.chatHashList[i].search(complete_hash_regex) !== -1) {
          text += hash + " ";
          label += hash + " <comment>";
          is_complete_hash = true;
          break;
        } else if (cnl_chats.chatHashList[i].search(partial_hash_regex) !== -1)
        {
          labels.push(text + cnl_chats.chatHashList[i] + " <comment>");
          texts.push(text + cnl_chats.chatHashList[i] + " ");
          is_valid_hash = true;
        }
      }

      if (command.length === 0) {
        if (is_complete_hash) {
          matches = matches.concat([{label: label,
                                     value: text}]);
        } else if (is_valid_hash) {
          for (var i=0; i<labels.length; i+=1)
            matches = matches.concat([{label: labels[i],
                                       value: texts[i]}]);
        }
        return matches;
      }

      if (is_complete_hash) {
        text += command;
        matches = matches.concat([{label: label,
                                   value: text}]);
        return matches;
      }
    }
    return matches;
  },

  isValidHelpSyntax: function (command) {
    var is_valid = false;
    var help_regex = [/^\s*@help\s*$/g];

    is_valid = !!command.match(help_regex[0]);
    return is_valid;
  },

  isValidReplySyntax: function (command) {
    var is_valid = false,
        hash = "",
        comment = "";

    command = command.trim();

    // starts with '@reply #'
    if (!!!command.match(/^\s*@reply\s*(?=[#])/g)) {
      // console.log("doesn't start with '@reply '");
      return is_valid;
    }
    command = command.replace(/^(\s)*@reply\s*#/g, "");

    if (command.search(/^[0-9a-z]*(?![^\s])/g) === -1) {
      // invalid user-given hash value
      return is_valid;
    }

    var hash = command.match(/^[0-9a-z]*(?![^\s])/g)[0];
    command = command.replace(/^[0-9a-z]*(?![^\s])\s*/g, "");

    var is_valid_hash = false,
        complete_hash_regex;

    for (var i=0; i<cnl_chats.chatHashList.length; i+=1) {
      complete_hash_regex = new RegExp("^"+hash+"$", "g");
      if (!!cnl_chats.chatHashList[i].match(complete_hash_regex)) {
        is_valid_hash = true;
        break;
      }
    }

    if (!is_valid_hash){
      // invalid hash value given
      // console.log("invalid hash");
      return is_valid;
    }

    if (command.length === 0){
      // empty comment
      // console.log("empty comment");
      return is_valid;
    }
    else {
      is_valid = true;
    }

    return is_valid;
  },

  isPossibleTypo: function (command) {
    var is_valid = false;
    var typo_regex = [/^\s*(?=@)/g];

    is_valid = !!command.match(typo_regex[0]);

    return is_valid;
  },

  helpWrapper: function (command) {

    console.log(cnl_chats.valid_syntax);
  },

  chatWrapper: function (command) {
    socket.send(JSON.stringify({
      "command": "new_chat",
      "description": command,
      "room": room_label,
      "is_reply": false,
    }));
  },

  replyWrapper: function (command) {
    var hash_value, description;

    command = command.trim();

    // remove with '@reply #'
    command = command.replace(/^(\s)*@reply\s*#/g, "");

    var hash_value = command.match(/^[0-9a-z]*(?![^\s])/g)[0];
    command = command.replace(/^[0-9a-z]*(?![^\s])\s*/g, "");
    //description = command;

    // console.log(hash_value, command);

    socket.send(JSON.stringify({
      "command": "new_chat",
      "description": command,
      "hash": hash_value,
      "room": room_label,
      "is_reply": true,
    }));
  },

  showTypoAlertMessage: function (command) {
    command = "'" + command + "'";
    console.log(command, "is not a valid command. " +
    "See '@help' for the list of available commands.");
  },

  newChat: function (obj) {
    var is_end_of_scroll = $('#chat_list_scroll').scrollTop() === $('#chat_list_scroll')[0].scrollHeight - $('#chat_list_scroll').height();
    var appended_elem = 0;
    if (obj.is_reply) {
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
      this.chatHashList.push(String(obj.hash_value));
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
    if (is_end_of_scroll) {
      $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'slow');
    }
    else {
      if ($('#chat_scroll_button').css('visibility') == 'hidden') {
        toBeScrolledPosition(appended_elem.position().top);
        $('#chat_scroll_button').css('visibility', 'visible');
      }
    }
  },

  newNotice: function (obj) {
    var preappended_elem = $('#shown-notice').find('div.notice-with-time').detach();
    if(preappended_elem.length !== 0) {
      preappended_elem.prependTo('#hidden-notice');
    }

    $('#shown-notice').append('\
        <div class="notice-with-time">\
          <p class="card-text" style="margin-bottom: 0px;">' + obj.description + '</p>\
          <p class="card-text text-muted" style="text-align:right;">' + obj.time + '</p>\
        </div>');
  },

  //Server to User
  startPoll: function (obj) {
    q_str = "Q. How does this get toggled? Let's make this question much longer!";
    a_strs = ['Lorem ipsum dolor sit amet', 'consectetur adipiscing', 'elit', 'sed do eiusmod tempor incididunt ut labore et'];
    
    $('#contents-wrapper').css('visibility', 'hidden');
    var a_strs_str = '<h1 id="polls-question" class="display-4" align="center" style="margin: 50px auto; display: block; max-width: 1000px; text-align: center;">' + q_str + '</h1>'
    for(var i=0; i<a_strs.length; i+=1) {
      a_strs_str += '<button type="button" class="btn btn-secondary btn-lg btn-block" onclick="endPoll(' + i.toString() + ')">' + a_strs[i] + '</button>';
    }
    $('#polls-wrapper').append(a_strs_str);
  },

  // User to Server
  endPoll: function(obj) {
    $('#polls-wrapper').empty();
    $('#contents-wrapper').css('visibility', 'visible');
    // debug: do something with ret_idx
    console.log('endPoll');
    console.log(ret_idx);

    socket.send(JSON.stringify({
      "command": "end_poll",
      "question": obj.question,
      "answer": obj.index
    }));
  },

  // Create a result chart / from server
  resultPoll: function (obj) {
    var question = obj.question;
    var answer_count = obj.answer_count;

    var is_end_of_scroll = $('#chat_list_scroll').scrollTop() === $('#chat_list_scroll')[0].scrollHeight - $('#chat_list_scroll').height();
    var ctx = $('<canvas id="poll_' + obj.hash_value + '" width="400" height="400"></canvas>');
    $('#chat_list_items').append(ctx);
    /*
    var pollChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: obj.answers,
        datasets: [{
          label: '',
          data: [13, 43, 92, 13],//data: Array.apply(null, {length: obj.answers.length}).map(function() {return 0;}),
        }],
      },
      options: {
        responiveAnimationDuration: 100,
        text: obj.question,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
    */

    if (is_end_of_scroll) {
      $('#chat_list_scroll').animate({scrollTop: ctx.position().top}, 'slow');
    }
    else {
      if ($('#chat_scroll_button').css('visibility') == 'hidden') {
        toBeScrolledPosition(ctx.position().top);
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
