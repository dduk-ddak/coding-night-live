from django.contrib import admin
from .models import Room

# Register your models here.
class RoomAdmin(admin.ModelAdmin):
    list_display = ('admin_user', 'title', 'link', 'time', 'label')

admin.site.register(Room, RoomAdmin)
