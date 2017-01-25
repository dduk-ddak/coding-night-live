import os
import time
import hashlib
from os import path
from binascii import hexlify

from django.db import models
from django.utils import timezone

from manage_room.models import Room
#from manage_room.models import Room, Slide

# Create your models here.
def _createHash():
    """generate 10 character long hash"""
    hash = hashlib.sha1()
    hash.update(str(time.time()))
    return  hash.hexdigest()[:-10]

class Notice(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)    #fk
    _id = models.AutoField(primary_key=True)
    time = models.DateTimeField(default=timezone.now)
    description = models.TextField()
    
    def __str__(self):
        return self._id

class Poll(models.Model):
    _id = models.AutoField(primary_key=True)
    #room = models.ForeignKey(Room, on_delete=models.CASCADE)
    #slide = models.ForeignKey(Slide, on_delete=models.CASCADE)    #fk
    time = models.DateTimeField(default=timezone.now)
    description = models.TextField()

    def __str__(self):
        return self._id

class ChatAndReply(models.Model):
    _id = models.AutoField(primary_key=True)
    #slide = models.ForeignKey(Slide, on_delete=models.CASCADE)    #fk
    #room = models.ForeignKey(Room, on_delete=models.CASCADE)
    hash_value = models.CharField(max_length=10, default=_createHash, unique=True)
    time = models.DateTimeField(default=timezone.now)
    is_reply = models.BooleanField(default=False)
    description = models.TextField()
    
    def __str__(self):
        return self._id
