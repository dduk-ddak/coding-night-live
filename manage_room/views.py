from django.shortcuts import render
from django.views.generic.edit import CreateView
from django.db import transaction
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.sites.models import Site

from haikunator import Haikunator

from .models import Room

class RoomCreateView(LoginRequiredMixin):
    model = Room
    
    room = None
    while not room:
        with transaction.atomic():
            share_link = Haikunator.haikunate()  # Ex) 'icy-dream-4198'
            if model.objects.filter(label=share_link).exists():
                continue
            url = 'http://'+Site.objects.get_current().domain+'/services/'+share_link
            room = Room(link=url, label=share_link)
