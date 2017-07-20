from channels import route
from manage_room import consumers

# Websocket command : join => call room_join
custom_routing = [
    route("room.receive", consumers.room_join, command="^join$"),
    route("room.receive", consumers.room_leave, command="^leave$"),
    route("room.receive", consumers.rename_room, command="^rename_room$"),
    route("room.receive", consumers.new_slide, command="^new_slide$"),
    route("room.receive", consumers.get_slide, command="^get_slide$"),
    route("room.receive", consumers.del_slide, command="^del_slide$"),
    route("room.receive", consumers.curr_slide, command="^curr_slide$"),
    route("room.receive", consumers.change_slide_order, command="^change_slide_order$"),
    route("room.receive", consumers.rename_slide, command="^rename_slide_title$"),
    route("room.receive", consumers.change_slide, command="^change_slide$"),
    route("room.receive", consumers.get_slide_diff, command="^get_slide_diff$"),
]
