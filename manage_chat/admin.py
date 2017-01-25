from django.contrib import admin
from .models import Notice, Poll, ChatAndReply

# Register your models here.
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('room', '_id', 'time', 'description')

class PollAdmin(admin.ModelAdmin):
    list_display = ('_id', 'time', 'description')
    #list_display = ('slide', '_id', 'time', 'description')

class ChatAndReplyAdmin(admin.ModelAdmin):
    list_display = ('_id', 'time', 'description', 'hash_value', 'is_reply')
    #list_display = ('slide', '_id', 'time', 'description', 'hash_value', 'is_reply')

admin.site.register(Notice, NoticeAdmin)
admin.site.register(Poll, PollAdmin)
admin.site.register(ChatAndReply, ChatAndReplyAdmin)
