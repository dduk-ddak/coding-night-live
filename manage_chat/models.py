from django.db import models
from django.utils import timezone

from manage_room.models import Room

# Create your models here.
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
    hash_value = models.CharField(default=_createHash, unique=True)
    time = models.DateTimeField(default=timezone.now)
    is_reply = models.BooleanField(default=False)
    description = models.TextField()

