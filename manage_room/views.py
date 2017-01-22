from django.shortcuts import render, redirect
#from django.views.generic.edit import request
from django.db import transaction
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.sites.models import Site

from haikunator import Haikunator

from .models import Room

class RoomCreateView(request, LoginRequiredMixin):
    model = Room
    url = 'http://' + Site.objects.get_current().domain + '/services/'
    
    if request.method == "POST":
        room = None
        while not room:
            with transaction.atomic():
                share_link = Haikunator.haikunate()  # Ex) 'icy-dream-4198'
                if model.objects.filter(label=share_link).exists():
                    continue
                url += share_link
                room = Room(admin_user=request.user, link=url, label=share_link)
                room.save()
        #return redirect(url, pk=room.pk)

class RoomDeleteView(request, LoginRequiredMixin):
    model = Room
    if request.method == "POST":
        pass
        #room = request.
