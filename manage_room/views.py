import random

from django.http import HttpResponse

from django.shortcuts import render, redirect
from django.db import transaction
from django.views.generic.base import TemplateView
from django.contrib.sites.models import Site
from django.contrib.auth.decorators import login_required

from haikunator import Haikunator

from .models import Room

@login_required
def RoomCreateView(request):
    return HttpResponse("hello world")
    url = 'http://' + Site.objects.get_current().domain + '/services/'
    room = None

    while not room:
        with transaction.atomic():
            share_link = Haikunator.haikunate()  # Ex) 'icy-dream-4198'
            if Room.objects.filter(label=share_link).exists():
                continue
            url += share_link
            room = Room.objects.create(admin_user=request.user, link=url, label=share_link)
    #return redirect(RedirectRoom, room.label)

def RoomDeleteView(request, LoginRequiredMixin):
    Room.objects.filter(admin_user=request.user, link=request.link).delete()

class RedirectRoomView(TemplateView):
    template_name='room.html'
