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

from coding_night_live.views import MainView, PageNotFound

import manage_room.views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url(r'^$', MainView.as_view(), name='main'),
    url(r'^admin/', admin.site.urls),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^services/$', manage_room.views.RoomListView, name='services'),
    url(r'^services/new/', manage_room.views.RoomCreateView, name='new'),
    url(r'^services/delete/(?P<pk>([a-z]{3,}-[a-z]{3,}-[0-9]{1,4}))/$', manage_room.views.RoomDeleteView, name='delete'),
    url(r'^([a-z]{3,}-[a-z]{3,}-[0-9]{1,4})/$', manage_room.views.RedirectRoomView.as_view(), name='redirect_room'),
    url(r'^([a-z]{3,}-[a-z]{3,}-[0-9]{1,4})/pdf/$', manage_room.views.MarkdownToPdfView, name='get_pdf'),
    url(r'^auth/', include('django.contrib.auth.urls'), {'next_page': '/'}),
    url(r'^404/$', PageNotFound, name='page_not_found'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
