from django.views.generic.base import TemplateView

# Create your views here.
class MainView(TemplateView):
    template_name='main.html'
