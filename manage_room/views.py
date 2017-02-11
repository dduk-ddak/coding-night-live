# /services/list.html - manage the room (create, delete, ..)
import random

from django.http import HttpResponse, HttpResponseRedirect, HttpRequest

from django.shortcuts import render, get_object_or_404
from django.db import transaction
from django.views.generic.base import TemplateView
from django.contrib.sites.models import Site
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required

from haikunator import Haikunator

from .models import Room, Slide
from manage_chat.views import get_chat_list, get_notice_list, get_poll_list

#test add
#from markdown import markdown
#import pdfkit

# Create your views here.
# create a room and redirect to the room
@login_required
def RoomCreateView(request):
    url = 'http://' + Site.objects.get_current().domain + '/'
    room = None

    while not room:
        with transaction.atomic():
            share_link = Haikunator.haikunate()  # Ex) 'icy-dream-4198'
            if Room.objects.filter(label=share_link).exists():
                continue
            url += share_link
            room = Room.objects.create(title=share_link, admin_user=request.user, link=url, label=share_link)
    header = Slide.objects.create(title="header@slide", room=room)  # Create header slide
    first_slide = Slide.objects.create(room=room)
    header.next_id = first_slide.now_id
    header.save()

    return HttpResponseRedirect(url)

# delete a room
@login_required
def RoomDeleteView(request, pk):
    Room.objects.filter(admin_user=request.user, label=pk).delete()
    url = 'http://' + Site.objects.get_current().domain + '/services'
    return HttpResponseRedirect(url)

# check room list
@login_required
def RoomListView(request):
    rooms = Room.objects.filter(admin_user=request.user).order_by('time')
    return render(request, 'list.html', {'rooms': rooms})

# convert markdown to pdf
def MarkdownToPdfView(request, label):
    label = label.strip('/')
    try:
        room = Room.objects.get(label=label)
        header = Slide.objects.get(title="header@slide", room=room)
        
        text = ""
        while header.next_id != 0:
            header = Slide.objects.get(now_id=header.next_id, room=room)
            text += ('#' + str(header.title))
            text += '\n\n'
            text += header.md_blob
            text += '\n'

        md_file_name = './static/pdfs/' + str(label) + '.md'
        with open(md_file_name, 'w') as md_file:
            md_file.write(text)
        
        return HttpResponse('<h1>Hello this PDF</h1>')
    except:
        return HttpResponse('<h1>' + label + ' room does not exist!</h1>')


class RedirectRoomView(TemplateView):
    template_name='room.html'
    
    def get_context_data(self, **kwargs):
        label = self.request.path
        label = label.strip('/')    # get label

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
                check_admin = Room.objects.get(label=label, admin_user=self.request.user)  #check admin user
                is_admin = True
            except:
                # Matching query does not exist - request.user is not a admin_user
                pass
        pdf_link = room.link + '/pdf/'
        return {'admin': is_admin, 'title': room.title, "head_notice": head_notice, "notices": notices, "all_chats": all_chats, "slides": title_list, "pdf": pdf_link}
