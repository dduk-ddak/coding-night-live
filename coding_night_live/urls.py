"""coding_night_live URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin

from allauth import urls

from coding_night_live.views import MainView, withdraw
import manage_room.views

custom_conf = urls
del custom_conf.urlpatterns[0]
del custom_conf.urlpatterns[0]

urlpatterns = [
    url(r'^services/withdraw/$', withdraw, name='withdraw'),
    url(r'^$', MainView.as_view(), name='main'),
    url(r'^admin/', admin.site.urls),
    url(r'^accounts/', include(custom_conf)),
    url(r'^services/$', manage_room.views.room_list_view, name='services'),
    url(r'^services/new/', manage_room.views.room_create_view, name='new'),
    url(
        r'^services/delete/(?P<pk>([a-z]{3,}-[a-z]{3,}-[0-9]{1,4}))/$',
        manage_room.views.room_delete_view,
        name='delete'
    ),
    url(
        r'^([a-z]{3,}-[a-z]{3,}-[0-9]{1,4})/$',
        manage_room.views.RedirectRoomView.as_view(),
        name='redirect_room'
    ),
    url(
        r'^([a-z]{3,}-[a-z]{3,}-[0-9]{1,4})/pdf/$',
        manage_room.views.markdown_to_pdf_view,
        name='get_pdf'
    ),
    url(r'^auth/', include('django.contrib.auth.urls'), {'next_page': '/'}),
]
