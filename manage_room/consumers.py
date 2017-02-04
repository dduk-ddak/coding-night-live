# WebSocket handling
import json

from django.db import transaction
from channels import Channel, Group
from channels.auth import channel_session_user_from_http, channel_session_user

from .models import Room, Slide

from .setting import MSG_TYPE_LEAVE, MSG_TYPE_ENTER, NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS
from .utils import get_room_or_error, catch_client_error
from .exceptions import ClientError

### Chat channel handling ###

# Channel_session_user loads the user out from the channel session and presents
# it as message.user. There's also a http_session_user if you want to do this on
# a low-level HTTP handler, or just channel_session if all you want is the
# message.channel_session object without the auth fetching overhead.
@channel_session_user
@catch_client_error
def room_join(message):
    # Find the room they requested (by ID) and add ourselves to the send group
    # Note that, because of channel_session_user, we have a message.user
    # object that works just like request.user would. Security!
    room = get_room_or_error(message["room"])

    # Send a "enter message" to the room if available
    if NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS:
        room.send_message(MSG_TYPE_ENTER)

    # OK, add them in. The websocket_group is what we'll send messages
    # to so that everyone in the chat room gets them.
    room.websocket_group.add(message.reply_channel)
    #message.channel_session['room'] = list(set(message.channel_session['room']).union([room.label]))
    # Send a message back that will prompt them to open the room
    # Done server-side so that we could, for example, make people
    # join rooms automatically.
    message.reply_channel.send({
        "text": json.dumps({
            "join": str(room.label),
            "title": room.title,
        }),
    })

@channel_session_user
@catch_client_error
def room_leave(message):
    # Reverse of join - remove them from everything.
    room = get_room_or_error(message["room"])

    # Send a "leave message" to the room if available
    if NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS:
        room.send_message(MSG_TYPE_LEAVE)

    room.websocket_group.discard(message.reply_channel)
    #message.channel_session['room'] = list(set(message.channel_session['room']).difference([room.label]))
    # Send a message back that will prompt them to close the room
    message.reply_channel.send({
        "text": json.dumps({
            "leave": str(room.label),
        }),
    })

@channel_session_user
@catch_client_error
def room_title_rename(message):
    room = get_room_or_error(message["room"])

    room.send_title(message["title"])

@channel_session_user
@catch_client_error
def new_slide(message):
    #need to add admin_user authentication
    room = get_room_or_error(message["room"])
    last_slide = Slide.objects.get(next_id=0, room=room)
    with transaction.atomic():
        slide = Slide.objects.create(room=room)
        last_slide.next_id = slide.now_id
        last_slide.save()

    slide.send_idx()

@channel_session_user
@catch_client_error
def del_slide(message):
    #need to add admin_user authentication
    room = get_room_or_error(message["room"])
    delete_slide = Slide.objects.filter(room=room, now_id=message["id"])
    slide = Slide.objects.filter(room=room, next_id=message["id"])
    slide.next_id = delete_slide.next_id
    
    delete_slide.delete()
    slide.save()

@channel_session_user
@catch_client_error
def get_slide(message):
    room = get_room_or_error(message["room"])
    slide = Slide.objects.get(room=room, now_id=message["id"])

    message.reply_channel.send({
        "text": json.dumps({
            "get_slide": message["id"],
            "md_blob": slide.md_blob,
            "title": slide.title,
            "idx": slide.now_id,
        }),
    })

"""
@channel_session_user
@catch_client_error
def change_slide(message):
    #need to add admin_user authentication
    room = get_room_or_error(message["room"])
    change_slide = Slide.objects.filter(room=room, now_id=message["id"])
    #more..
"""

@channel_session_user
@catch_client_error
def change_slide_order(message):
    #need to add admin_user authentication
    room = get_room_or_error(message["room"])
    a_slide = Slide.objects.filter(room=room, now_id=message["id"])
    b_slide = Slide.objects.filter(room=room, now_id=message["next_id"])

    temp = b_slide.next_id
    c_slide = Slide.objects.filter(room=room, next_id=message["next_id"])

    if c_slide:
        c_slide.next_id = a_slide.id
        b_slide.next_id = a_slide.next_id
        a_slide.next_id = temp
        c_slide.save()
    else:
        b_slide.next_id = a_slide.next_id
        a_slide.next_id = temp
    
    a_slide.save()
    b_slide.save()

"""
@channel_session_user
@catch_client_error
def current_slide(message):
    #need to add admin_user authentication
""" 

@channel_session_user
@catch_client_error
def rename_slide(message):
    #need to add admin_user authentication
    room = get_room_or_error(message["room"])
    slide = Slide.objects.fliter(room=room, now_id=message["id"])
    slide.title = message["title"]
    slide.save()

# header slide title is "header@slide"
def get_slide_list(message):
    room = get_room_or_error(message["room"])
    header = Slide.objects.get(title="header@slide", room=room)
    title_list = []
    header = Slide.objects.get(now_id=header.next_id)
    while header.next_id != 0:
        value = (str(header.title), str(header.now_id))
        title_list.append(value)
        header = Slide.objects.get(now_id=header.next_id)
    print(title_list)
