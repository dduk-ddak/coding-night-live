from django.http import HttpResponse, HttpResponseRedirect, JsonResponse

from django.db import transaction
from django.views.generic.base import TemplateView
from django.contrib.auth.decorators import login_required

from manage_chat.views import get_chat_list, get_notice_list, get_poll_list
from manage_room.models import Room, Slide
from manage_room.utils import get_room, get_slide_list


class RoomListApiView():
    def get():
        room_list = Room.objects.all().order_by('created')
        context = {'room_list': room_list}
        return context


class RoomApiView():
    pass


class RoomManageApiView():
    # Create new room
    def post():
        room = None

        while not room:
            room_url = 'temp'
            with transaction.atomic():
                try:
                    room = Room.objects.create(
                        title=title
                        label=room_url
                    )
                except Exception as err:
                    print(f'[ERROR] {err}')

        header = Slide.objects.create(header=True, room=room)    # Create header slide
        first_slide = Slide.objects.create(room=room)    # Create first empty slide
        header.next_id = first_slide.curr_id
        header.save()

    # Delete a room
    def delete():
        room_id = ''
        try:
            Room.objects.get(curr_id=room_id).delete()
        except Exception as err:
            print(f'[ERROR] {err}')


class RoomPdfApiView():
    # Export room contents as PDF
    def post():
        room_id = ''
        slides = list()

        room = get_room(room_id)
        notice_list = get_notice_list(room)
        slide_list = get_slide_list(room)

        response = {
            'room': room,
            'notice_list': notice_list,
            'slide_list': slide_list,
        }


class RedirectRoomView(TemplateView):
    template_name = 'room.html'

    def get_context_data(self, **kwargs):
        label = self.request.path
        label = label.strip('/')    # Get label

        room = Room.objects.get(label=label)
        notices = get_notice_list(label).reverse()
        chats, replies = get_chat_list(label)
        polls = get_poll_list(label)

        title_list = []
        header = Slide.objects.get(title="header@slide", room=room)
        while header.next_id != 0:
            header = Slide.objects.get(now_id=header.next_id, room=room)
            value = (str(header.title), str(header.now_id))
            title_list.append(value)

        head_notice = ''
        if notices:
            head_notice, notices = notices[0], notices[1:]

        reply_dict = {}
        for idx in range(len(chats)):
            reply_dict[chats[idx].hash_value] = []
        for reply in replies:
            reply_dict[reply.assist_hash].append(reply)

        all_chats = []
        poll_idx = 0
        for chat in chats:
            while poll_idx < len(polls) and chat.time > polls[poll_idx].time:
                all_chats.append(polls[poll_idx])
                poll_idx += 1
            all_chats.append(chat)
            for reply in reply_dict[chat.hash_value]:
                all_chats.append(reply)
        all_chats += polls[poll_idx:]

        is_admin = False
        if not self.request.user.is_anonymous():
            try:
                # Check admin user
                Room.objects.get(label=label, admin_user=self.request.user)
                is_admin = True
            except Exception as ex:
                # Matching query does not exist - request.user is not a admin_user
                print('request.user is not a admin user', ex)
        pdf_link = room.link + '/pdf/'
        return {
            'admin': is_admin,
            'title': room.title,
            'head_notice': head_notice,
            'notices': notices,
            'all_chats': all_chats,
            'slides': title_list,
            'pdf': pdf_link
        }
