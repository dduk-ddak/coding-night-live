import random

from django.http import HttpResponse, HttpResponseRedirect

from django.shortcuts import render
from django.db import transaction
from django.views.generic.base import TemplateView
from django.contrib.sites.models import Site
from django.contrib.auth.decorators import login_required

from haikunator import Haikunator

from .models import Room

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
            room = Room.objects.create(admin_user=request.user, link=url, label=share_link)
    return HttpResponseRedirect(url)

@login_required
def RoomDeleteView(request, pk):
    Room.objects.filter(admin_user=request.user, label=pk).delete()
    return HttpResponse("<h1>done</h1>")

@login_required
def RoomListView(request):
    rooms = Room.objects.filter(admin_user=request.user).order_by('time')
    return render(request, 'list.html', {'rooms': rooms})

class RedirectRoomView(TemplateView):
    template_name='room.html'
