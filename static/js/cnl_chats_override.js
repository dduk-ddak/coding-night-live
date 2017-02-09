cnl_chats.valid_syntax = {
    help: "@help",
    reply: "@reply <hash_value> <comment>",
    chat: "<comment>",
    notice: "@notice [<args>]",
    poll: "@poll [-t <\"title\">] <\"options\", ...>",
};

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
      notice_regex = [/^(\s)*@notice\s+.*$/g];

  is_valid = !!command.match(notice_regex[0]);

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

  return matches;
}

cnl_chats.noticeWrapper = function (command) {
  command = command.replace(/^(\s)*@notice\s+/g, "");

  socket.send(JSON.stringify({
      "command": "notice",
      "description": command,
      "room": room_label
  }));

  return;
}

cnl_chats.pollWrapper = function (question, answer) {
  console.log("run poll");
  socket.send(JSON.stringify({
      "command": "new_poll",
      "question": question,
      "answer": answer,
      "room": room_label
  }));

  return;
}

cnl_chats.newPoll = function (obj) {
  var is_end_of_scroll = $('#chat_list_scroll').scrollTop() === $('#chat_list_scroll')[0].scrollHeight - $('#chat_list_scroll').height();
  var ctx = $('<canvas id="poll_' + obj.hash_value + '" width="400" height="400"></canvas>');
  $('#chat_list_items').append(ctx);
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

  if (is_end_of_scroll) {
    $('#chat_list_scroll').animate({scrollTop: ctx.position().top}, 'slow');
  }
  else {
    if ($('#chat_scroll_button').css('visibility') == 'hidden') {
      toBeScrolledPosition(ctx.position().top);
      $('#chat_scroll_button').css('visibility', 'visible');
    }
  }
}

cnl_chats.operationTable = [
  cnl_chats.helpWrapper,
  cnl_chats.replyWrapper,
  cnl_chats.chatWrapper,
  cnl_chats.noticeWrapper,
  cnl_chats.pollWrapper,
  cnl_chats.showTypoAlertMessage,
];
