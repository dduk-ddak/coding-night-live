from channels import include

channel_routing = [
    include("manage_room.routing.websocket_routing", path=r"^/room/user_count/"),
    include("manage_room.routing.custom_routing"),
]
