from django.contrib import admin
from .models import Room, Slide

# Register your models here.
class RoomAdmin(admin.ModelAdmin):
    list_display = ('admin_user', 'title', 'link', 'time', 'label')

class SlideAdmin(admin.ModelAdmin):
    list_display = ('md_blob', 'now_id', 'prev_id', 'next_id')

admin.site.register(Room, RoomAdmin)
admin.site.register(Slide, SlideAdmin)
