from functools import wraps

from .exceptions import ClientError

from manage_room.models import Room, Slide


def catch_client_error(func):
    '''
    Decorator to catch the ClientError exception
    and translate it into a reply.
    '''
    @wraps(func)
    def inner(message, *args, **kwargs):
        try:
            return func(message, *args, **kwargs)
        except ClientError as e:
            '''
            If we catch a client error,
            tell it to send an error string
            back to the client on their reply channel
            '''
            e.send_to(message.reply_channel)
    return inner


def get_room_or_error(room_label):
    '''
    Tries to fetch a room for the user,
    checking permissions along the way.
    '''
    try:
        room = Room.objects.get(label=room_label)
    except Room.DoesNotExist:
        raise ClientError("ROOM_INVALID")
    return room


def get_room(room_id):
    try:
        room = Room.objects.get(curr_id=room_id)
    except Exception as err:
        return None
    else:
        return room


def get_slide_list(room):
    slide_list = list()

    if room:
        header = Slide.objects.get(header=True, room=room)

        while header.next_id != 0:
            header = Slide.objects.get(curr_id=header.next_id, room=room)
            slide_list.append(header)
    return slide_list

