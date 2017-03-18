from django.shortcuts import render

from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.views.generic.base import TemplateView

# Create your views here.
class MainView(TemplateView):
    template_name = 'main.html'
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return HttpResponseRedirect('/services/')
        return super(MainView, self).dispatch(request, *args, **kwargs)

def PageNotFound(request):
    return render(request, '404.html', status=404)

def withdraw(request):
    if request.method == 'POST':
        User.objects.get(email=request.user.email).delete
    else:
        print('Request method is not a GET.')
    return HttpResponseRedirect('/')