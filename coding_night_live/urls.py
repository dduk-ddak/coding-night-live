from django.conf import settings
from django.contrib import admin
from django.urls import path, include

from coding_night_live.views import MainView


urlpatterns = [
    path('', MainView, name='main'),
    path('admin/', admin.site.urls),
    path('services/', include('manage_room.urls', namespace='manage_room')),
    #url(r'^auth/', include('django.contrib.auth.urls'), {'next_page': '/'}),
]

