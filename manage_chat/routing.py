from channels import route
from .consumers import new_chat, new_notice, new_poll, end_poll, get_poll

custom_routing = [
    route("room.receive", new_chat, command="^new_chat$"),
    route("room.receive", new_notice, command="^notice$"),
    route("room.receive", new_poll, command="^new_poll$"),
    route("room.receive", end_poll, command="^end_poll$"),
    route("room.receive", get_poll, command="^get_poll$"),
]
