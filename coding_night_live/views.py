from django.shortcuts import render

from django.http import HttpResponseRedirect
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
