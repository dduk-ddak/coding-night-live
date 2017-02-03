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
    Slide.objects.create(title="header@slide")  # Create header slide

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

class RedirectRoomView(TemplateView):
    template_name='room.html'
    
    def get_context_data(self, **kwargs):
        label = self.request.path
        label = label.strip('/')    # get label

        room = Room.objects.get(label=label)
        notices = get_notice_list(label)
        chat_and_reply = get_chat_list(label)   # [0]: chat / [1] : reply
        
        # future ..
        # polls = get_poll_list(label)
        # return {'title': room.title, "notices": notices, "chats": chat_and_reply[0], "replys": chat_and_reply[1], "polls": polls}
        
        return {'title': room.title, "notices": notices, "chats": chat_and_reply[0], "replys": chat_and_reply[1]}
