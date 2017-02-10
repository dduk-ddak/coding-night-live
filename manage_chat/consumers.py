# WebSocket handling
import json

from django.db import transaction
from channels import Channel, Group
from channels.auth import channel_session_user_from_http, channel_session_user

from manage_room.models import Room
from manage_room.consumers import check_admin
from manage_room.utils import get_room_or_error, catch_client_error

from .models import ChatAndReply, Notice, Poll

@channel_session_user
@catch_client_error
def new_chat(message):
    room = get_room_or_error(message["room"])

    if message["is_reply"]:
        chat = ChatAndReply.objects.create(room=room, is_reply=True, description=message["description"], assist_hash=message["hash"])
        chat.send_message_reply(message["description"], message["hash"], room.label)
    else:
        chat = ChatAndReply.objects.create(room=room, description=message["description"])
        chat.send_message(message["description"], room.label)

@channel_session_user
@catch_client_error
def new_notice(message):
    if check_admin(message):
        room = get_room_or_error(message["room"])
        
        notice = Notice.objects.create(room=room, description=message["description"])
        notice.send_message(message["description"], room.label)
    else:
        pass

@channel_session_user
@catch_client_error
def new_poll(message):
    if check_admin(message):
        room = get_room_or_error(message["room"])
        answers = json.loads(message["answer"])
        answer_count = json.dumps([0] * len(answers))
        poll = Poll.objects.create(room=room, question=message["question"], answer=message["answer"], answer_count=answer_count)
        if not message["question"]:
            poll.question = 'poll_' + poll.hash_value
            poll.save()

        poll.start_poll(message["room"])
    else:
        pass

@channel_session_user
@catch_client_error
def end_poll(message):
    room = get_room_or_error(message["room"])
    with transaction.atomic():
        poll = Poll.objects.get(room=room, hash_value=message["hash_value"])
        answer_count = json.loads(poll.answer_count)    # list result
        answer_count[int(message["answer"])] += 1
        poll.answer_count = json.dumps(answer_count)
        poll.save()

    poll.result_poll(message["room"])
