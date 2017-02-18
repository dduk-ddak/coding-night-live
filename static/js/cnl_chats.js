var cnl_chats = {
  valid_syntax: {
      help: "@help",
      reply: "@reply #<hash_value> <description>",
      notice: "@notice <description>",
      poll: "@poll [-t <\"question\">] <\"answers\", ...>",
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

      for (var i=cnl_chats.chatHashList.length-1; i>=0; i-=1) {
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
          // change this to adjust the maximum number of returned autocompletion
          var maximum_autocompletion_num = Object.keys(this.valid_syntax).length;
          var i = labels.length < maximum_autocompletion_num ? labels.length : maximum_autocompletion_num;
          for (i -= 1; i>=0; i-=1)
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

  // overriden at admin for more description
  helpWrapper: function (command) {
    var appended_elem = $('\
        <div>\
          <div class="card">\
            <div class="card-block" style="border:1px solid #adf; border-left-width:5px; border-radius:3px; padding-bottom:10px;">\
            <h4 class="card-text" style="margin-bottom: 10px; color: #5ebeff;">@help</h4>\
            <p class="card-text">\
              <p><b>@help</b>: Show this message. <i>ex)</i><code>@help</code></p>\
              <p style="margin-bottom:0px;"><b>@reply</b>: Reply to a specific thread. <i>ex)</i><code>@reply #47cd926 this is reply</code></p>\
            </p>\
          </div>\
        </div>');
    $('#chat_list_items').append(appended_elem);
    $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'fast');
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
    console.log(command, "is not a valid command. " +
    "See '@help' for the list of available commands.");
    var appended_elem = $('\
        <div>\
          <div class="card">\
            <div class="card-block" style="border:1px solid #d9534f; border-left-width:5px; border-radius:3px; padding-bottom:10px;">\
            <h4 class="card-text" style="margin-bottom: 10px; color: #e85550;">Invalid command</h4>\
            <p class="card-text">\
              <code>' + command + '</code> is not a valid command. Type <code>@help</code> for the list of available commands.\
            </p>\
          </div>\
        </div>');

    $('#chat_list_items').append(appended_elem);
    $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'fast');
  },

  newChat: function (obj) {
    var is_end_of_scroll = $('#chat_list_scroll').scrollTop() === $('#chat_list_scroll')[0].scrollHeight - $('#chat_list_scroll').height();
    var appended_elem = 0;
    if (obj.is_reply) {
      appended_elem = $('\
          <div style="float: left; width: 30px; margin-top: 10px;"><i class="fa fa-reply" aria-hidden="true"></i></div>\
            <div class="card" style="margin-left:30px;">\
              <div class="card-block" style="padding-top:1em; padding-bottom:1em;">\
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
              <div class="card-header" style="padding-left:15px; padding-bottom:0.5em; padding-top:0.5em;">\
                <div style="float:left; margin-right:10px;"><i class="fa fa-commenting-o" aria-hidden="true"></i> ' + obj.hash_value + '</div>\
                <div style="font-size:0.8em; margin-top:0.1em;" align="right">' + obj.time + '</div>\
              </div>\
              <div class="card-block" style="padding-top:1em; padding-bottom:1em;">\
                <p class="card-text">' + obj.description + '</p>\
              </div>\
            </div>\
          </div>');
      $('#chat_list_items').append(appended_elem);
    }

    if (is_end_of_scroll) {
      $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'fast');
    }
    else {
      if ($('#chat_scroll_button').css('visibility') == 'hidden') {
        toBeScrolledPosition(appended_elem.position().top);
        $('#chat_scroll_button').css('visibility', 'visible');
      }
    }
    $('#qna_card_block').animate({backgroundColor:'#adf'}, 'fast');
    $('#chat_' + obj.hash_value + ' .card-block').animate({backgroundColor:'#adf'}, 'fast');
    setTimeout(function() {
      $('#qna_card_block').animate({backgroundColor:'#ffffff'}, 'slow');
      $('#chat_' + obj.hash_value + ' .card-block').animate({backgroundColor:'#ffffff'}, 'slow');
    }, 1000);
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
    chatListResize();

    $('#notice_card_block').animate({backgroundColor:'#adf'}, 'fast');
    setTimeout(function() {
      $('#notice_card_block').animate({backgroundColor:'#ffffff'}, 'slow');
    }, 1000);
  },

  // Server to User
  startPoll: function (obj) {
    var is_end_of_scroll = $('#chat_list_scroll').scrollTop() === $('#chat_list_scroll')[0].scrollHeight - $('#chat_list_scroll').height();
    var a_strs = JSON.parse(obj.answer);
    var q_str = obj.question
    q_str = q_str.replace(/'/g, "\\'");
    q_str = q_str.replace(/"/g, '\\"');

    // it is not admin
    if($('#polls-wrapper').length !== 0) {
      var a_strs_str = '<h1 id="polls-question" class="display-4" align="center" style="margin: 50px auto; display: block; max-width: 1000px; text-align: center;">' + q_str + '</h1>';
      for(var i=0; i<a_strs.length; i+=1) {
        a_strs_str += '<button type="button" class="btn btn-secondary btn-lg btn-block" onclick="cnl_chats.endPoll(\'' + i + '\', \'' + q_str + '\', \'' + obj.hash_value + '\')">' + a_strs[i] + '</button>';
      }
      a_strs_str = '<div class="poll-prompt" id="poll_prompt_' + obj.hash_value + '">' + a_strs_str + '</div>';
      console.log(a_strs_str);

      $('#contents-wrapper').css('visibility', 'hidden');
      $('#polls-wrapper').append(a_strs_str);
    }

    var appended_elem = $('\
        <div id="poll_' + obj.hash_value + '">\
          <div class="card">\
            <div class="card-header" style="padding-left:15px; padding-bottom:0.5em; padding-top:0.5em;">\
              <div style="float:left; margin-right:10px;">\
                <i class="fa fa-pie-chart" aria-hidden="true"></i> ' + q_str + '</div>\
            </div>\
            <div class="card-block" style="padding-top:1em; padding-bottom:1em;">\
              <div id="poll_holder_' + obj.hash_value + '">\
                <p class="text-muted" style="margin-bottom:0px; text-align:center">No one answered yet.</p>\
              </div>\
            </div>\
          </div>\
        </div>');
    $('#chat_list_items').append(appended_elem);

    if (is_end_of_scroll) {
      $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'fast');
    }
    else {
      if ($('#chat_scroll_button').css('visibility') == 'hidden') {
        toBeScrolledPosition(appended_elem.position().top);
        $('#chat_scroll_button').css('visibility', 'visible');
      }
    }
  },

  // User to Server
  endPoll: function (index, question, polls_hash) {
    $('#poll_prompt_' + polls_hash).remove();
    if($('.poll-prompt').length === 0) {
      $('#polls-wrapper').empty();
      $('#contents-wrapper').css('visibility', 'visible');
    }

    socket.send(JSON.stringify({
      "command": "end_poll",
      "hash_value": polls_hash,
      "answer": index,
      "room": room_label,
    }));
  },

  // Create a result chart / from server
  resultPoll: function (obj) {
    this.resultPollCache[obj.hash_value] = obj;

    var question = obj.question;
    var answer = JSON.parse(obj.answer);
    var answer_count = JSON.parse(obj.answer_count);
    var hash_value = obj.hash_value;

    // Create the data table
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Answer');
    data.addColumn('number', 'Result');

    var data_array = [];
    for (var i = 0; i < answer.length; i++) {
      var value = [answer[i], answer_count[i]];
      data_array.push(value);
    }
    data.addRows(data_array);

    var poll_size = $('#poll_holder_' + hash_value).width();

    // Set chart options
    var options = {
      'width': poll_size,
      'height': poll_size,
      'chartArea': { width: "100%", height: "80%" },
      'legend': {'position': 'bottom', 'alignment': 'center'}
    };
    if(question.length === 0) options['title'] = 'poll_' + hash_value;

    // Instantiate and draw our chart, passing in some options.
    $('#poll_holder_' + hash_value).empty();
    var chart = new google.visualization.PieChart(document.getElementById('poll_holder_' + hash_value));
    chart.draw(data, options);
  },

  // Get chart data by hash value
  getPoll: function(hash_value) {
    socket.send(JSON.stringify({
      "command":"get_poll",
      "room":room_label,
      "hash_value":hash_value,
    }));
  },
};

cnl_chats.resultPollCache = [];

cnl_chats.chatHashList = [];

cnl_chats.operationTable = [
  cnl_chats.helpWrapper,
  cnl_chats.replyWrapper,
  cnl_chats.chatWrapper,
  cnl_chats.showTypoAlertMessage,
];
