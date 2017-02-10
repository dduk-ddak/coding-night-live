cnl_chats.operationEnum = {
  help: 0,
  reply: 1,
  chat: 2,
  notice: 3,
  poll: 4,
  typo: 5,
};

cnl_chats.classifyOperation = function (command) {
  var operation_idx;
  if (this.isValidHelpSyntax(command)) {
    operation_idx = this.operationEnum.help;
  } else if (this.isValidReplySyntax(command)) {
    operation_idx = this.operationEnum.reply;
  } else if (this.isValidNoticeSyntax(command)){
    operation_idx = this.operationEnum.notice;
  } else if (this.isValidPollSyntax(command)) {
    operation_idx = this.operationEnum.poll;
  } else if (this.isPossibleTypo(command)) {
    operation_idx = this.operationEnum.typo;
  } else {
    operation_idx = this.operationEnum.chat;
  }

  return operation_idx;
}

cnl_chats.getAutocompletion = function (command, matches) {
  matches = this.getHelpAutocompletion(command, matches);
  matches = this.getReplyAutocompletion(command, matches);
  matches = this.getNoticeAutocompletion(command, matches);
  matches = this.getPollAutocompletion(command, matches);

  return matches;
}

cnl_chats.get_delimiter = function (command) {
  // if delimiter specified, returns the delimiter
  // otherwise returns false
  var delimiter = false;
  for(var i=0; i<command.length; i+=1) {
    if(command[i] === '"' || command[i] === "'") {
      delimiter = command[i];
      break;
    }
  }

  return delimiter;
}

cnl_chats.get_and_remove_title = function(command, delimiter) {
  var title = false;

  // remove "-t "
  command = command.replace(/^-t\s*(?![^\"\'])/g, "");

  for(var i=1; i < command.length; i+=1) {
    if(command[i] === delimiter && command[i-1] !== "\\") {
      title = command.substring(1, i);
      title = title.trim();
      command = command.substring(i+1);
      break;
    }
  }

  command = command.replace(/^\s*/g, "");
  return [command, title];
}

cnl_chats.get_and_remove_answers = function(command, delimiter) {
  var answer = "",
      answers = [],
      option_given = false,
      invalid = false,
      answer_regex = new RegExp("^\\s*,\\s*\\"+delimiter, "g");

  command = command.trim();
  if(command[0] !== delimiter)
    invalid = true;

  do {
    option_given = false;
    for(var i=1; i<command.length; i+=1) {
      if(command[i] === delimiter && command[i-1] !== "\\") {

        answer = command.substring(1, i);
        answer = answer.trim();
        if(answer.length !== 0) answers.push(answer);

        command = command.substring(i+1);
        option_given = true; break;
      }
    }
    if(option_given === false)
      return [command, false];
    if(command.search(answer_regex) === -1){
      break;
    }
    else
      command = command.replace(/^\s*,\s*/g, "");
  } while(command.length > 0);

  if(invalid)
    return [command, false];
  else
    return [command, answers];
}

cnl_chats.isValidNoticeSyntax = function (command) {
  var is_valid = false,
      notice_regex = [/^(\s)*@notice\s+/g];

  if(command.search(notice_regex[0]) === -1)
    return is_valid;
  else
    command = command.replace(notice_regex[0], "");

  if(command.length === 0)
    return is_valid;
  else
    is_valid = true;

  return is_valid;
}

cnl_chats.isValidPollSyntax = function (command) {
  var is_valid = false,
      poll_regex = [/^(\s)*@poll\s+/g],
      delimiter = '"',
      title_given = false;

  if(command.search(poll_regex[0]) === -1) {
    // should start with '@poll '
    return is_valid;
  } else {
    command = command.replace(poll_regex[0], "");
  }

  delimiter = cnl_chats.get_delimiter(command);

  if(command.search(/^-t\s*(?![^\"\'])/g) !== -1) {
    // question is given before the answers
    title_given = true;

    var ret = cnl_chats.get_and_remove_title(command, delimiter);
    if(ret[1] === false)
      return is_valid;
    else
      command = ret[0];
  }

  if(command[0] !== delimiter)
    return is_valid;

  var ret = cnl_chats.get_and_remove_answers(command, delimiter);
  if(ret[1] === false)
    return is_valid;
  else
    command = ret[0];

  command = command.trim();
  if(title_given === true) {
    if(command.length !== 0)
      return is_valid;
  }
  if(command.length === 0)
    return is_valid = true;

  if(command.search(/^-t\s*(?![^\"\'])/g) !== -1) {
    // question is given after the answers
    title_given = true;

    var ret = cnl_chats.get_and_remove_title(command, delimiter);
    if(ret[1] === false)
      return is_valid;
    else
      command = ret[0];
  } else {
    return is_valid;
  }

  command = command.trim();
  if(command.length === 0)
    is_valid = true;

  return is_valid;
}

cnl_chats.getNoticeAutocompletion = function (command, matches) {
  var notice_regex = [
    /@/g, /@n/g, /@no/g,
    /@not/g, /@noti/g, /@notic/g,
    /@notice/g, /^(\s)*@notice\s+.*$/g,];

  var len = command.length,
      upper_bound = 7, // length of '@notice'
      is_valid = false,
      text = "@notice ",
      notice = "";

  if(len <= upper_bound) {
    // user is still typing the command;
    // check for partial syntax.
    is_valid = !!command.match(notice_regex[len-1]);
  } else {
    // check for full syntax
    is_valid = !!command.match(notice_regex[upper_bound]);
    // to retrieve only the notice message:
    // command.replace(/^(@notice\s*)/g, "");
    notice = command.replace(/^(@notice\s*)/g, "");
    text += notice;
  }

  if(is_valid === true) {
    matches = matches.concat([{label: cnl_chats.valid_syntax.notice,
                               value: text}]);
  }
  return matches;
}

cnl_chats.getPollAutocompletion = function (command, matches) {
  var poll_regex = [
      /^@$/g, /^@p$/g, /^@po$/g,
      /^@pol$/g, /^@poll$/g,
      /^@poll\s$/g,
  ];

  var poll_opt_regex = [
    /^-t\s*(?![^\"\'])/g,
    /^-(?![^t])/g,
  ];

  var len = 0,
    upper_bound = 6,          // length of '@poll '
    is_valid = false,
    title_given = false,
    text = "@poll ",
    title = null,
    delimiter = "\"",  // either ' || "
    options = [];

  // remove leading white spaces
  command = command.replace(/^\s*/g, "");
  len = command.length;
  if(len <= upper_bound) {
    // user is still typing the command;
    // valid commands include: @, @p, @po, @pol, @poll
    if(!!command.match(poll_regex[len-1]))
      return matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
    else
      return matches;
  } else {
    if(!!!command.match(/^@poll\s+(?![^-\'\"])/g)) {
      // command doesn't start with '@poll '
      // or the first character after '@poll ' is invalid
      return matches;
    }
    // command starts with '@poll '
    // remove '@poll ' from the command
    command = command.replace(/^@poll\s+/g, "");
    if(command.length === 0) {
      // input command is '@poll '
      matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
      return matches;
    } else {
      command = command.trim();
    }
    if(!!command.match(/^-(?=[^t])/g)) {
      // check for invalid option
      return matches;
    }
    for(var i=0; i<poll_opt_regex.length; i+=1) {
      // title option is given before "","",...
      // if title given, sets title_given to true
      // console.log("[debug] checking for early title option");
      if(!!command.match(poll_opt_regex[i])) {
        title_given = true;
        command = command.replace(poll_opt_regex[i], "");
        text += "-t ";
        if(command.length === 0) {
          // input command is '@poll -t'
          text += (delimiter+delimiter);
          matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
          return matches;
        } else break;
      }
    }
    // console.log("[debug] checking for quotation choice");
    if(command[0] !== '"' && command[0] !== "'") {
      return matches;
    } else {
      delimiter = command[0];
    }
    if (title_given === true) {
      // console.log("[debug] retrieving early title");
      var finished = false;
      for(var i=1; i<command.length; i+=1) {
        if(command[i] === delimiter && command[i-1] !== "\\") {
          // user has finished typing title
          title = command.substring(1, i);
          title = title.trim();
          command = command.substring(i+1);
          finished = true; break;
        }
      }
      if(command.length === 0) {
        // user has given only the title
        text += delimiter + title + delimiter + " ";
        matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
        return matches;
      } else if(finished === false) {
        // user is in the middle of typing the title
        // delete the leading quotation mark and trim the white spaces
        command = command.substring(1);
        command = command.trim();
        text += delimiter+ command + delimiter + " ";
        matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
        return matches;
      } else if(finished === true) {
        // user has given the title, and there is more to come...
        text += delimiter + title + delimiter + " ";
      }
    } // end of if (title_given === true)
    // remove leading white spaces
    command = command.replace(/^\s*/g, "");
    if(command[0] !== delimiter)
      return matches;
    var option = "", finished = false;
    do {
      option = "", finished = false;
      for(var i=1; i<command.length; i+=1) {
        if(command[i] === delimiter && command[i-1] !== "\\") {
          // user has finished typing title
          option = command.substring(1, i);
          option = option.trim();
          if(option.length !== 0) options.push(option);
          command = command.substring(i+1);
          finished = true; break;
        }
      }
      if(command.length === 0) {
        // this option marks the end of user input
        for(var i=0; i<options.length; i+=1) {
          text += delimiter + options[i] + delimiter;
          if(i !== options.length-1) text += ', ';
          else if (i !== 0) text += ' ';
        }
        matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
        return matches;
      } else if(finished === false) {
        // user is in the middle of typing the option
        // delete the leading quotation mark and trim the white spaces
        command = command.substring(1);
        command = command.trim();
        options.push(command);
        for(var i=0; i<options.length; i+=1) {
          text += delimiter + options[i] + delimiter;
          if(i !== options.length-1) text += ', ';
        }
        matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
        return matches;
      } else if(finished === true) {
        // user has given the option, and there is more to come...
        command = command.replace(/^\s*/g, "");
        if(command[0] === ',') {
          command = command.replace(/^,\s*/g, "");
          if(command.length !== 0) {
            if(command[0] !== delimiter)
              return matches;
          } else {
            for(var i=0; i<options.length; i+=1) {
              text += delimiter + options[i] + delimiter;
              text += ', ';
            } text += delimiter + delimiter;
            matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
            return matches;
          }
        } else if (title_given === false && command[0] === '-') {
          break;
        } else {
          return matches;
        }
      }
    } while(true);
    // if you are here, options are taken care of,
    // and user has not given the title option yet.
    // command should start with "-"
    if(!!command.match(/^-(?=[^t])/g)) {
      // check for invalid option
      return matches;
    }
    title = "";
    for(var i=0; i<poll_opt_regex.length; i+=1) {
      // title option is given after "","",...
      if(!!command.match(poll_opt_regex[i])) {
        command = command.replace(poll_opt_regex[i], "");
        text += "-t ";
        if(command.length === 0) {
          // input command is '@poll -t'
          text += (delimiter+delimiter+' ');
          for(var i=0; i<options.length; i+=1) {
            text += delimiter + options[i] + delimiter;
            if(i !== options.length-1) text += ', ';
          }
          matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
          return matches;
        } else break;
      }
    }
    if(command[0] !== delimiter)
      return matches;
    var finished = false;
    for(var i=1; i<command.length; i+=1) {
      if(command[i] === delimiter && command[i-1] !== "\\") {
        // user has finished typing title
        title = command.substring(1, i);
        title = title.trim();
        command = command.substring(i+1);
        finished = true; break;
      }
    }
    if(command.length === 0) {
      // user has given only the title
      text += delimiter + title + delimiter + " ";
    } else if(finished === false) {
      // user is in the middle of typing the title
      // delete the leading quotation mark and trim the white spaces
      command = command.substring(1);
      command = command.trim();
      text += delimiter+ command + delimiter + " ";
      for(var i=0; i<options.length; i+=1) {
        text += delimiter + options[i] + delimiter;
        if(i !== options.length-1) text += ', ';
      }
      matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
      return matches;
    } else if(finished === true) {
      // user has given the title, and there is more to come...
      text += delimiter + title + delimiter + " ";
    }
    // title and options all taken care of
    // there should be no remaining characters in command
    if(command.length !== 0)
      return matches;
  } // if(len <= upper_bound) else
  // for debugging: print title, options
  // console.log('title == ', title);
  // console.log('options == ', options);
  for(var i=0; i<options.length; i+=1) {
    text += delimiter + options[i] + delimiter;
    if(i !== options.length-1) text += ', ';
  }
  matches = matches.concat([{label: cnl_chats.valid_syntax.poll, value: text}]);
  return matches;
}

// overriden for more description
cnl_chats.helpWrapper = function (command) {
  var appended_elem = $('\
      <div>\
        <div class="card">\
          <div class="card-block" style="border:1px solid #adf; border-left-width:5px; border-radius:3px; padding-bottom:10px;">\
          <h4 class="card-text" style="margin-bottom: 10px; color: #5ebeff;">@help</h4>\
          <p class="card-text">\
            <p><b>@help</b>: Show this message. <i>ex)</i><code>@help</code></p>\
            <p><b>@reply</b>: Reply to a specific thread. <i>ex)</i><code>@reply #47cd926 this is reply</code></p>\
            <p><b>@notice</b>: Display new notice. <i>ex)</i><code>@notice this is notice</code></p>\
            <p style="margin-bottom:0px;"><b>@poll</b>: Start a poll. <i>ex)</i><code>@poll -t "this is question" "ans 1", "ans 2", "ans 3"</code></p>\
          </p>\
        </div>\
      </div>');
  $('#chat_list_items').append(appended_elem);
  $('#chat_list_scroll').animate({scrollTop: appended_elem.position().top}, 'fast');
};

cnl_chats.noticeWrapper = function (command) {
  command = command.replace(/^(\s)*@notice\s+/g, "");

  socket.send(JSON.stringify({
      "command": "notice",
      "description": command,
      "room": room_label
  }));

  return;
}

cnl_chats.pollWrapper = function (command) {

  var is_valid = false,
      poll_regex = [/^(\s)*@poll\s+/g],
      delimiter = '"',
      title_given = false,
      question = "",
      answers = [];

  command = command.replace(poll_regex[0], "");
  delimiter = cnl_chats.get_delimiter(command);

  if(command.search(/^-t\s*(?![^\"\'])/g) !== -1) {
    // question is given before the answers
    title_given = true;
    var ret = cnl_chats.get_and_remove_title(command, delimiter);
    command = ret[0];
    question = ret[1];
  }

  var ret = cnl_chats.get_and_remove_answers(command, delimiter);
  command = ret[0];
  answers = ret[1];

  command = command.trim();

  if(command.search(/^-t\s*(?![^\"\'])/g) !== -1) {
    // question is given after the answers
    title_given = true;

    var ret = cnl_chats.get_and_remove_title(command, delimiter);
    question = ret[1];
  }

  // replacing \delimiter with delimiter
  var delimiter_regex = new RegExp ("\\\\"+delimiter, "g");
  for(var i=0; i<answers.length; i+=1) {
    answers[i] = answers[i].replace(delimiter_regex, delimiter);
  }
  question = question.replace(delimiter_regex, delimiter);

  socket.send(JSON.stringify({
      "command": "new_poll",
      "question": question,
      "answer": JSON.stringify(answers),
      "room": room_label
  }));

  return;
}

cnl_chats.operationTable = [
  cnl_chats.helpWrapper,
  cnl_chats.replyWrapper,
  cnl_chats.chatWrapper,
  cnl_chats.noticeWrapper,
  cnl_chats.pollWrapper,
  cnl_chats.showTypoAlertMessage,
];
