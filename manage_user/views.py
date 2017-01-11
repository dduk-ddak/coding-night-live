from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.
class RoomListView(LoginRequiredMixin, TemplateView):
    login_url = '/'
    redirect_field_name = '/'
    template_name='list.html'
