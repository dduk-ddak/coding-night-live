import json
import allauth

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from channels import Group

from .setting import MSG_TYPE_MESSAGE

# Create your models here.

class Room(models.Model):
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE)  #fk
    #admin_user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    #admin_user = models.ForeignKey(allauth.socialaccount.models.SocialAccount, on_delete=models.CASCADE)
    
    title = models.CharField(max_length=255, default="NoTitle")
    link = models.URLField(primary_key=True)    #pk
    time = models.DateTimeField(default=timezone.now)

    label = models.SlugField(unique=True)

    def __str__(self):
        return self.title

    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group(self.label)

    def send_message(self, msg_type=MSG_TYPE_MESSAGE):
        """
        Called to send a message to the room on behalf of a user.
        """
        final_msg = {'room': str(self.label), 'msg_type': msg_type,}

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

    def send_title(self, new_title):
        self.title = new_title
        self.save()

        final_msg = {'rename_title': str(self.label), 'title': str(self.title),}

        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

class Slide(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    title = models.CharField(max_length=35, default="Unnamed slide")
    md_blob = models.TextField(default="")
    #id linked list
    now_id = models.AutoField(primary_key=True)     #pk
    next_id = models.PositiveSmallIntegerField(default=0) #if 0: last element
    #next_id = models.PositiveSmallIntegerField(unique=True) #if 0: last element

    def __str__(self):
        return str(self.now_id)
    
    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group(str(self.idx))
    
    def send_idx(self):
        final_msg = {'new_slide': str(self.now_id),}

        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )
