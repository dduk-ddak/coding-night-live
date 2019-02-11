from .models import ChatAndReply, Notice, Poll
from manage_room.models import Room


def get_chat_list(request):
    # Request is room's label
    room = Room.objects.get(label=request)

    chats = ChatAndReply.objects.filter(room=room, is_reply=False).order_by('time')
    replies = ChatAndReply.objects.filter(room=room, is_reply=True).order_by('time')

    return (chats, replies)


def get_notice_list(request):
    # Request is room's label
    room = Room.objects.get(label=request)

    notices = Notice.objects.filter(room=room).order_by('time')

    return notices


def get_poll_list(request):
    # Request is room's label
    room = Room.objects.get(label=request)

    polls = Poll.objects.filter(room=room).order_by('time')

    return polls
