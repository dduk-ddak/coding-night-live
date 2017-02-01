from channels import include, route
from .consumers import ws_connect, ws_receive, ws_disconnect

websocket_routing = [
    route("websocket.connect", ws_connect),
    route("websocket.receive", ws_receive),
    route("websocket.disconnect", ws_disconnect),
]

channel_routing = [
    # /Room/
    include("coding_night_live.routing.websocket_routing", path=r"^/room/"),
    #include("manage_room.routing.websocket_routing", path=r"^/room/user_count/"),
    include("manage_room.routing.custom_routing"),
    # /Chat/
    #include("manage_chat.routing.websocket_routing", path=r"^/talk/"),
    include("manage_chat.routing.custom_routing"),
]

"""
websocket_routing = [
    route("websocket.connect", ws_connect),
    route("websocket.receive", ws_receive),
    route("websocket.disconnect", ws_disconnect),
]
"""
