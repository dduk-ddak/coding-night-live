# WebSocket handling
import json

from channels import Channel, Group
from channels.auth import channel_session_user_from_http, channel_session_user

from manage_room.models import Room
from manage_room.utils import get_room_or_error, catch_client_error

from .models import ChatAndReply, Notice, Poll
from .setting import NOTIFY_USERS_NOTICE_POLL_CHAT

@channel_session_user
@catch_client_error
def new_chat(message):
    room = get_room_or_error(message["room"])

    if NOTIFY_USERS_NOTICE_POLL_CHAT:
        if message["is_reply"]:
            chat = ChatAndReply.objects.create(room=room, is_reply=True, description=message["description"], assist_hash=message["hash"])
            chat.send_message_reply(message["description"], message["hash"], room.label)
        else:
            chat = ChatAndReply.objects.create(room=room, description=message["description"])
            chat.send_message(message["description"], room.label)

@channel_session_user
@catch_client_error
def new_notice(message):
    room = get_room_or_error(message["room"])
    #need to add : checking admin_user
     
    notice = Notice.objects.create(room=room, description=message["description"])
    notice.send_message(message["description"], room.label)
    #notice.send_message(message["description"])

@channel_session_user
@catch_client_error
def new_poll(message):
    room = get_room_or_error(message["room"])
    answer_count = {}
    for i in range(0, len(message["answer"])):
        answer = message["answer"][i]
        answer_count[answer] = 0
    answer_count = json.dumps(answer_count) # dictinary json dumps -> str
    poll = Poll.objects.create(room=room, question=message["question"], answer=message["answer"], answer_count=answer_count)

    poll.start_poll(room.label)

@channel_session_user
@catch_client_error
def end_poll(message):
    # developing...
    room = get_room_or_error(message["room"])
    poll = Poll.objects.get(room=room, question=message["question"])
    answer = message["answer"]
    answer_count = json.loads(poll.answer_count)    # dict result
    answer_count[answer] += 1

    poll.answer_count = json.dumps(answer_count)
    poll.save()

    poll.result_poll()
