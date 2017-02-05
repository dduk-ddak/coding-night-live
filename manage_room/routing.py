from channels import route
from .consumers import room_join, room_leave, room_title_rename, new_slide, del_slide, change_slide_order, rename_slide, get_slide

# Websocket command : join => call room_join
custom_routing = [
    route("room.receive", room_join, command="^join$"),
    route("room.receive", room_leave, command="^leave"),
    route("room.receive", room_title_rename, command="^rename_room_title$"),
    route("room.receive", new_slide, command="^new_slide$"),
    route("room.receive", get_slide, command="^get_slide$"), 
    route("room.receive", del_slide, command="^del_slide$"),
    route("room.receive", change_slide_order, command="^change_slide_order$"),
    route("room.receive", rename_slide, command="^rename_slide_title$"),
    #route("room.receive", get_slide_list, command="^get_slide_list$"),
]
