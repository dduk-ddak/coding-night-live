from channels import route
from .consumers import room_join, room_leave, room_title_rename
#from .consumers import ws_connect, ws_receive, ws_disconnect, room_join, room_leave

"""
websocket_routing = [
    route("websocket.connect", ws_connect),
    route("websocket.receive", ws_receive),
    route("websocket.ws_disconnect", ws_disconnect),
]
"""

# Websocket command : join => call room_join
custom_routing = [
    route("room.receive", room_join, command="^join$"),
    route("room.receive", room_leave, command="^leave"),
    route("room.receive", room_title_rename, command="^rename_room_title$"),
]
