import json

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

import allauth

#from channels import Group

# Create your models here.

class Room(models.Model):
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE)  #fk
    #admin_user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    #admin_user = models.ForeignKey(allauth.socialaccount.models.SocialAccount, on_delete=models.CASCADE)
    
    #email = admin_user.email
    title = models.CharField(max_length=255, default="NoTitle")
    link = models.URLField(primary_key=True)    #pk
    time = models.DateTimeField(default=timezone.now)
    #slide = models.Field()  #fk

    label = models.SlugField(unique=True)

    def __str__(self):
        return self.title

"""
class Slide(models.Model):
    md_blob = models.FileField()

    #id linked list
    now_id = models.PositiveSmallIntegerField(primary_key=True)     #pk
    prev_id = models.PositiveSmallIntegerField()
    next_id = models.PositiveSmallIntegerField()

    def __str__(self):
        return self.now_id
"""
