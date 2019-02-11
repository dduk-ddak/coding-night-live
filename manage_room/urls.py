from django.urls import path

from manage_room import views


app_name = 'manage_room'
urlpatterns = [
    path('', views.RoomListApiView, name='list-room'),
    path('<title>', views.RoomApiView, name='room'),
    path('add', views.RoomManageApiView, name='add-room'),
    path('remove', views.RoomManageApiView, name='remove-room'),
    path('export-pdf', views.RoomPdfApiView, name='export-room-pdf'),
]

