# WebSocket handling
import json

from django.db import transaction
from django.core.cache import cache
from channels import Channel, Group
from channels.auth import channel_session_user_from_http, channel_session_user

from .models import Room, Slide

from .setting import MSG_TYPE_LEAVE, MSG_TYPE_ENTER, NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS
from .utils import get_room_or_error, catch_client_error
from .exceptions import ClientError

from .diff_match_patch.java_hashcode_conv import javaHash
from .diff_match_patch import diff_match_patch

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
    hash_blob = javaHash(slide.md_blob)

    if cache.ttl("%s/%s" % (message["room"], message["id"])) == 0:
        cache.set("%s/%s" % (message["room"], message["id"]), slide.md_blob, timeout=60)
        cache.set("%s/%s/%s" % (message["room"], message["id"], hash_blob), slide.md_blob, timeout=60)
    else:
        cache.expire("%s/%s" % (message["room"], message["id"]), timeout=60)
        cache.expire("%s/%s/%s" % (message["room"], message["id"], hash_blob), timeout=60)

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
    """
    room = get_room_or_error(message["room"])
    a_slide = Slide.objects.get(room=room, now_id=message["id"])
    b_slide = Slide.objects.get(room=room, next_id=message["next_id"])

    temp = a_slide.next_id
    a_slide.next_id = b_slide.next_id
    b_slide.next_id = a_slide.now_id

    a_slide.save()
    b_slide.save()
    """
    """
    room = get_room_or_error(message["room"])
    a_slide = Slide.objects.get(room=room, now_id=message["id"])
    b_slide = Slide.objects.get(room=room, now_id=message["next_id"])

    temp_title = a_slide.title
    temp_md_blob = a_slide.md_blob

    a_slide.title = b_slide.title
    a_slide.md_blob = b_slide.md_blob
    b_slide.title = temp_title
    b_slide.md_blob = temp_md_blob

    a_slide.save()
    b_slide.save()
    """
    """
    idx = int(message["next_id"]) - 1

    room = get_room_or_error(message["room"])
    a_slide = Slide.objects.get(room=room, now_id=message["id"])
    b_slide = Slide.objects.get(room=room, next_id=message["next_id"])
    c_slide = Slide.objects.get(room=room, next_id=idx)
    
    is_header = Slide.objects.get(room=room, next_id=message["id"])
    if is_header.title == "header@slide":
        print("please modifiy header slide's next_id")
        is_header.next_id = b_slide.now_id
        is_header.save()
    
    temp = a_slide.next_id
    a_slide.next_id = b_slide.now_id
    b_slide.next_id = a_slide.now_id
    c_slide.next_id = temp

    a_slide.save()
    b_slide.save()
    """
    """
    room = get_room_or_error(message["room"])
    a_slide = Slide.objects.get(room=room, now_id=message["id"])
    b_slide = Slide.objects.get(room=room, now_id=message["next_id"])

    temp = b_slide.next_id
    c_slide = Slide.objects.get(room=room, next_id=message["next_id"])

    if c_slide:
        c_slide.next_id = a_slide.now_id
        b_slide.next_id = a_slide.next_id
        a_slide.next_id = temp
        c_slide.save()
    else:
        b_slide.next_id = a_slide.next_id
        a_slide.next_id = temp
    
    a_slide.save()
    b_slide.save()
    """

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
    slide = Slide.objects.get(room=room, now_id=message["id"])
    slide.title = message["title"]
    slide.save()

    slide.send_title()

@channel_session_user
@catch_client_error
def change_slide(message):
    #need to add admin_user authentication

    # cache is expired, moved to redis->sqlite
    with transaction.atomic():
        if cache.ttl("%s/%s" % (message["room"], message["id"])) == 0:
            room = get_room_or_error(message["room"])
            slide = Slide.objects.get(room=room, now_id=message["id"])
            hash_blob = javaHash(slide.md_blob)
            cache.set("%s/%s" % (message["room"], message["id"]), slide.md_blob, timeout=60)
            cache.set("%s/%s/%s" % (message["room"], message["id"], hash_blob), slide.md_blob, timeout=60)
        else:
            cache.expire("%s/%s" % (message["room"], message["id"]), timeout=60)

        if cache.ttl("%s/%s/%s" % (message["room"], message["id"], message["pre_hash"])) == 0:
            pre_text = cache.get("%s/%d" % (message["room"], message["id"]))
        else:
            cache.expire("%s/%s/%s" % (message["room"], message["id"], message["pre_hash"]), timeout=60)
            pre_text = cache.get("%s/%s/%s" % (message["room"], message["id"], message["pre_hash"]))

        dmp = diff_match_patch()
        patch_text = message["patch_text"]
        patches = dmp.patch_fromText(message["patch_text"])
        curr_text = dmp.patch_apply(patches, pre_text)[0]
        pre_hash = javaHash(pre_text)
        curr_hash = javaHash(curr_text)

        if curr_hash != message["curr_hash"] or pre_hash != message["pre_hash"]:
            diff = dmp.diff_main(pre_text, curr_text)
            patches = dmp.patch_make(pre_text, diff)
            patch_text = dmp.patch_toText(patches)
            print('something is wrong')
            pass # something wrong. broadcast whole string to everybody
        else:
            Group(message["room"]).send({
                "text": json.dumps({
                    "change_slide": "true",
                    "room": message["room"],
                    "id": message["id"],
                    "patch_text": patch_text,
                    "pre_hash": pre_hash,
                    "curr_hash": curr_hash,
                }),
            })


        # update redis
        cache.set("%s/%s" % (message["room"], message["id"]), curr_text)
        cache.set("%s/%s/%s" % (message["room"], message["id"], curr_hash), curr_text)

        # update sqlite
        room = get_room_or_error(message["room"])
        slide = Slide.objects.get(room=room, now_id=message["id"])
        slide.md_blob = curr_text
        slide.save()

@channel_session_user
@catch_client_error
def rename_room(message):
    # need to add admin_user authentication
    room = get_room_or_error(message["room"])
    room.title = message["title"]
    room.save()
    Group(message["room"]).send({
        "text": json.dumps({
            "rename_room": message["title"],
        }),
    })
    
