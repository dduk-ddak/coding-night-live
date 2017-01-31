import json
import time
import hashlib

from django.db import models
from django.utils import timezone
from channels import Group

from manage_room.models import Room

# Create your models here.
def _createHash():
    """generate 10 character long hash"""
    now = str(time.time()).encode('utf-8')
    hash = hashlib.sha1(now)
    return hash.hexdigest()[:-10]

class Notice(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)    #fk
    _id = models.AutoField(primary_key=True)
    time = models.DateTimeField(default=timezone.now)
    description = models.TextField()
    
    def __str__(self):
        return self._id
    
    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group(self.time)
    
    def send_message(self, message, label):
        """
        Called to send a message to the room on behalf of a user.
        """
        final_msg = {'room': label, 'message': message, 'time': str(self.time)}

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

class Poll(models.Model):
    _id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    time = models.DateTimeField(default=timezone.now)
    question = models.CharField(max_length=130)
    answer = models.TextField()    #tuple or dictionary.. but dictionary is better than a tuple. because this field will save a JSON data
    answer_count = models.TextField()   #will save a JSON data

    def __str__(self):
        return self._id

class ChatAndReply(models.Model):
    _id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    hash_value = models.CharField(max_length=10, default=_createHash, unique=True)
    time = models.DateTimeField(default=timezone.now)
    is_reply = models.BooleanField(default=False)
    description = models.TextField()
    
    def __str__(self):
        return self._id
    
    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group(self.time)
    
    def send_message(self, message, original_hash, label):
        """
        Called to send a message to the room on behalf of a user.
        """
        final_msg = {'room': label, 'message': message, 'time': str(self.time), 'reply_hash': original_hash}

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )
    
    #??
    def send_message(self, message, label):
        """
        Called to send a message to the room on behalf of a user.
        """
        final_msg = {'room': label, 'message': message, 'time': str(self.time)}

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )
