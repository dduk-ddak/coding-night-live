# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-02-10 18:53
from __future__ import unicode_literals

from django.db import migrations, models
import manage_chat.models


class Migration(migrations.Migration):

    dependencies = [
        ('manage_chat', '0005_auto_20170208_0303'),
    ]

    operations = [
        migrations.AddField(
            model_name='poll',
            name='hash_value',
            field=models.CharField(default=manage_chat.models._createHash, max_length=7, unique=True),
        ),
    ]