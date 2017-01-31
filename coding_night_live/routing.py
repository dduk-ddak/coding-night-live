from channels import include

channel_routing = [
    # /Room/
    include("manage_room.routing.websocket_routing", path=r"^/room/user_count/"),
    include("manage_room.routing.custom_routing"),
    # /Chat/
    include("manage_chat.routing.websocket_routing", path=r"^/talk/"),
    include("manage_chat.routing.custom_routing"),
]
