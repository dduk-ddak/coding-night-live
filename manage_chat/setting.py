from django.conf import settings

NOTIFY_USERS_NOTICE_POLL_CHAT = getattr(settings, 'NOTIFY_USERS_NOTICE_POLL_CHAT', True)
