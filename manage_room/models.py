import json
from django.db import models
from django.contrib.auth.models import User
from channels import Group

# Create your models here.
class Room(models.Model):
    admin_user = models.ForeignKey(User, on_delete=True)    #fk
    email = admin_user.email
    title = models.CharField()
    link = models.URLField(primary_key=True)    #pk
    time = models.DateTimeField()
    slide = models.Field()  #fk

    def __str__(self):
        return self.title

class Slide(models.Model):
    md_blob = models.FileField()

    #id linked list
    now_id = models.PositiveSmallIntegerField(primary_key=True)     #pk
    prev_id = models.PositiveSmallIntegerField()
    next_id = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.now_id
