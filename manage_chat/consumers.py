# WebSocket handling
import json

from channels import Channel, Group
from channels.auth import channel_session_user_from_http, channel_session_user

from .models import ChatAndReply, Notice, Poll
from manage_room.models import Room

@channel_session_user_from_http
def ws_connect(message):
    message.reply_channel.send({'accept': True})
    message.channel_session['room'] = []

def ws_receive(message):
    payload = json.loads(message['text'])
    payload['reply_channel'] = message.content['reply_channel']
    Channel("talk.receive").send(payload)

@channel_session_user
def ws_disconnect(message):
    for room_label in message.channel_session.get('room', set()):
        try:
            room = Room.objects.get(label=room_label)
            room.websocket_group.discard(message.reply_channel)
        except Room.DoesNotExist:
            pass

@channel_session_user
#@catch_client_error
def talk_join(message):
    room = get_room_or_error(message["room"])
    room.websocket_group.add(message.reply_channel)
    
    # test json sending
    message.reply_channel.send({
        "text": json.dumps({
            "join": str(room.label),
            "title": room.title,
            "ws": "talk",
        }),
    })

@channel_session_user
#@catch_client_error
def new_chat(message):
    room = get_room_or_error(message["room"])
    
    if NOTIFY_USERS_NOTICE_CHAT_POLL:
        if message["is_reply"]:
            #chat = new Roo
            chat.send_message(message["description"], message["hash"])
        else:
            chat.send_message(message["description"])
    
    message.reply_channel.send({
        "text": json.dumps({
            "function": "send chat",
            "title": room.title,
        }),
    })

@channel_session_user
#@catch_client_error
def new_notice(message):
    #check admin_user
    if NOTIFY_USERS_NOTICE_CHAT_POLL:
        notice.send_message(message["description"])
    message.reply_channel.send({
        "text": json.dumps({
            "function": "send notice",
            "title": room.title,
        }),
    })

@channel_session_user
#@catch_client_error
def start_poll(message):
    print('helloworld')

@channel_session_user
#@catch_client_error
def result_poll(message):
    print('helloworld')

