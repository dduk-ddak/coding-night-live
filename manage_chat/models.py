import os
import time
import hashlib
from os import path
from binascii import hexlify

from django.db import models
from django.utils import timezone

from manage_room.models import Room

# Create your models here.
def _createHash():
    """This function generate 10 character long hash"""
    hash = hashlib.sha1()
    hash.update(str(time.time()))
    return  hash.hexdigest()[:-10]

class Notice(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    _id = models.AutoField(primary_key=True)
    time = models.DateTimeField(default=timezone.now)
    description = models.TextField()

class Poll(models.Model):
    _id = models.AutoField(primary_key=True)
    #slide #fk
    time = models.DateTimeField(default=timezone.now)
    description = models.TextField()

class ChatAndReply(models.Model):
    _id = models.AutoField(primary_key=True)
    #slide #fk
    hash_value = models.CharField(max_length=10, default=_createHash, unique=True)
    time = models.DateTimeField(default=timezone.now)
    is_reply = models.BooleanField(default=False)
    description = models.TextField()

