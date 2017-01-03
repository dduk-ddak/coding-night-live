from django.shortcuts import render
from django.views.generic.base import TemplateView

# Create your views here.
class RoomListView(TemplateView):
    template_name='list.html'