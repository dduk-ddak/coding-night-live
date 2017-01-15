# ASGI config for coding_night_live project.
import os
from channels.asgi import get_channel_layer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coding_night_live.settings")
channel_layer = get_channel_layer()
