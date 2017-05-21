from django.contrib import admin
from .models import Notice, Poll, ChatAndReply


class NoticeAdmin(admin.ModelAdmin):
    list_display = ('room', '_id', 'time', 'description')


class PollAdmin(admin.ModelAdmin):
    list_display = (
        'room',
        '_id',
        'time',
        'question',
        'answer',
        'answer_count',
        'hash_value'
    )


class ChatAndReplyAdmin(admin.ModelAdmin):
    list_display = (
        'room',
        '_id',
        'time',
        'description',
        'hash_value',
        'is_reply'
    )


admin.site.register(Notice, NoticeAdmin)
admin.site.register(Poll, PollAdmin)
admin.site.register(ChatAndReply, ChatAndReplyAdmin)
