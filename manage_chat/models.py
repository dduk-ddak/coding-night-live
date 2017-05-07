import json
import time
import hashlib

from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import JSONField
from channels import Group

from manage_room.models import Room

# Create your models here.
def _createHash():
    # Generate 10 character long hash
    now = str(time.time()).encode('utf-8')
    hash = hashlib.sha1(now)
    return hash.hexdigest()[:7]

class Notice(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    _id = models.AutoField(primary_key=True)
    time = models.DateTimeField(default=timezone.now)
    description = models.TextField()

    def __str__(self):
        return str(self._id)

    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group(str(self.room.label))

    def send_message(self):
        """
        Called to send a message to the room on behalf of a user.
        """
        # time format ; ex) 2017-01-31 16:21:37
        final_msg = {
            'notice': self.room.label,
            'description': self.description,
            'time': str(self.time.strftime("%Y-%m-%d %H:%M:%S")),
        }

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

class Poll(models.Model):
    _id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    hash_value = models.CharField(max_length=7, default=_createHash, unique=True)
    time = models.DateTimeField(default=timezone.now)
    question = models.CharField(max_length=130)
    answer = JSONField()
    answer_count = JSONField()
    # for result {'yes': 4, 'no': 0, 'x': 2332}, this is divided and saved.
    # answer example : ['yes', 'no', 'x'] ; json list
    # answer_count example : [4, 0, 2332] ; json list

    def __str__(self):
        return str(self._id)

    @property
    def websocket_group(self):
        return Group(str(self.room.label))

    def start_poll(self, label):
        final_msg = {
            'start_poll': label,
            'question': self.question,
            'answer': self.answer,
            'hash_value': self.hash_value,
        }
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

    def result_poll(self, label):
        final_msg = {
            'result_poll': label,
            'question': self.question,
            'hash_value': self.hash_value,
            'answer': self.answer,              # json list
            'answer_count': self.answer_count,  # json list
        }
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

class ChatAndReply(models.Model):
    _id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    hash_value = models.CharField(max_length=7, default=_createHash, unique=True)
    assist_hash = models.CharField(max_length=7, default=0)    # saving existing hash (is_reply=True)
    time = models.DateTimeField(default=timezone.now)
    is_reply = models.BooleanField(default=False)
    description = models.TextField()

    def __str__(self):
        return str(self._id)

    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group(str(self.room.label))

    # is_reply = true / return original hash value
    def send_message_reply(self):
        """
        Called to send a message to the room on behalf of a user.
        """
        # time format ; ex) 2017-01-31 16:21:37
        final_msg = {
            'chat': self.room.label,
            'description': self.description,
            'time': str(self.time.strftime("%Y-%m-%d %H:%M:%S")),
            'is_reply': self.is_reply,
            'hash_value': str(self.assist_hash)[:10]
        }

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )
    
    # is_reply = false / return newly generated hash value
    def send_message(self):
        """
        Called to send a message to the room on behalf of a user.
        """
        # time format ; ex) 2017-01-31 16:21:37
        final_msg = {
            'chat': self.room.label,
            'description': self.description,
            'time': str(self.time.strftime("%Y-%m-%d %H:%M:%S")),
            'is_reply': self.is_reply,
            'hash_value': str(self.hash_value)[:20]
        }

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )
