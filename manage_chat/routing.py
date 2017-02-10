from channels import route
from .consumers import new_chat, new_notice, new_poll, end_poll

#websocket_routing = [
#    route("websocket.connect", ws_connect),
#    route("websocket.receive", ws_receive),
#    route("websocket.disconnect", ws_disconnect),
#]

# Websocket command :
custom_routing = [
    route("room.receive", new_chat, command="^new_chat$"),
    route("room.receive", new_notice, command="^notice$"),
    route("room.receive", new_poll, command="^new_poll$"),
    route("room.receive", end_poll, command="^end_poll$"),
]
