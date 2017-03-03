import json

from channels import Channel
from channels.auth import channel_session_user_from_http, channel_session_user

from manage_room.models import Room


@channel_session_user_from_http
def ws_connect(message):
    message.reply_channel.send({'accept': True})
    message.channel_session['room'] = []


def ws_receive(message):
    payload = json.loads(message['text'])
    payload['reply_channel'] = message.content['reply_channel']
    Channel('room.receive').send(payload)


@channel_session_user
def ws_disconnect(message):
    for room_label in message.channel_session.get("room", set()):
        try:
            room = Room.objects.get(label=room_label)
            room.websocket_group.discard(message.reply_channel)
        except Room.DoesNotExist:
            pass
