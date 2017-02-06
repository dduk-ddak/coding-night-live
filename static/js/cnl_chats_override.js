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

cnl_chats.operationTable = [
  cnl_chats.helpWrapper,
  cnl_chats.replyWrapper,
  cnl_chats.chatWrapper,
  cnl_chats.noticeWrapper,
  cnl_chats.pollWrapper,
  cnl_chats.showTypoAlertMessage,
];

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
},

cnl_chats.getAutocompletion = function (command, matches) {
  matches = this.getHelpAutocompletion(command, matches);
  matches = this.getReplyAutocompletion(command, matches);
  matches = this.getNoticeAutocompletion(command, matches);
  matches = this.getPollAutocompletion(command, matches);

  return matches;
}

cnl_chats.isValidNoticeSyntax = function (command) {

  return false;
}

cnl_chats.isValidPollSyntax = function (command) {

  return false;
}

cnl_chats.getNoticeAutocompletion = function (command, matches) {

  return matches;
}

cnl_chats.getPollAutocompletion = function (command, matches) {

  return matches;
}

cnl_chats.noticeWrapper = function (command) {
  console.log("run notice");
  // just for testing..
  socket.send(JSON.stringify({
      "command": "notice",
      "description": command,
      "room": room_label
  }));

  return;
}

cnl_chats.pollWrapper = function () {
  console.log("run poll");
  return;
}

cnl_chats.newNotice = function (obj) {
  var preappended_elem = $('#shown-notice').find('div.notice-with-time').detach();
  if(preappended_elem.length !== 0) {
    preappended_elem.prependTo('#hidden-notice');
  }

  $('#shown-notice').append('\
      <div class="notice-with-time">\
      <p class="card-text" style="margin-bottom: 0px;">' + obj.description + '</p>\
      <p class="card-text text-muted" style="text-align:right;">' + obj.time + '</p>\
      </div>');
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
