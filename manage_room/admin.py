from django.contrib import admin
from .models import Room, Slide


class RoomAdmin(admin.ModelAdmin):
    list_display = ('admin_user', 'title', 'link', 'time', 'label')


class SlideAdmin(admin.ModelAdmin):
    list_display = ('title', 'md_blob', 'now_id', 'next_id')


admin.site.register(Room, RoomAdmin)
admin.site.register(Slide, SlideAdmin)
