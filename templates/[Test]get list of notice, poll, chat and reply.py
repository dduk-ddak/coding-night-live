{% for notice in notices %}
    <script>
      var preappended_elem = $('#shown-notice').find('div.notice-with-time').detach();
      preappended_elem.prependTo('#hidden-notice');

      $('#hidden-notice').append('\
                <div class="notice-with-time">\
                  <p class="card-text" style="margin-bottom: 0px;">' + {{ notice.description }} + '</p>\
                  <p class="card-text text-muted" style="text-align:right;">' + {{ notice.time }} + '</p>\
                </div>');
    </script>
    {% endfor %}
    <!-- get list of chat -->
    {% for chat in chats %}
    <script>
      appended_elem = $('\
                  <div id="chat_' + {{ chat.hash_value }} + '">\
                    <div class="card">\
                      <div class="card-header" style="padding-left: .5rem;">\
                        <div style="float:left; margin-right: 10px;"><i class="fa fa-commenting-o" aria-hidden="true"></i> ' + {{ chat.hash_value }} + '</div> <div style="margin:0;font-size:.5em;" align="right">' + {{ chat.time }} + '</div>\
                      </div>\
                      <div class="card-block">\
                        <p class="card-text">' + {{ chat.description }} + '</p>\
                      </div>\
                    </div>');
      $('#chat_list_items').append(appended_elem);
    </script>
    {% endfor %}
    <!-- get list of reply -->
    {% for reply in replys %}
      <script>
        appended_elem = $('\
                      <div style="float: left; width: 30px; margin-top: 10px;"><i class="fa fa-reply" aria-hidden="true"></i></div>\
                      <div class="card" style="margin-left:30px;">\
                        <div class="card-block">\
                          <p class="card-text">' + {{ reply.description }} + '</p>\
                        </div>\
                      </div>');
        $('#chat_list_items').find('#chat_' + {{ reply.hash_value }}).append(appended_elem);
      </script>
    {% endfor %}
