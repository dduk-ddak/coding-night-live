from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.utils.crypto import get_random_string

from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    def social_app_setting(domain, client_id, secret):
        default_site_1 = Site.objects.get(id=1)
        default_site_1.domain = 'localhost:8000'    # Temp
        default_site_1.name = 'localhost:8000'    # Temp
        default_site_1.save()

        new_social_app = SocialApp(
            id=1,
            provider='google',
            name='localhost:8000',
            client_id='temp',
            secret='temp',
            key='',
        )

        new_social_app.save()
        new_social_app.sites.add(default_site_1)
        new_social_app.save()
    
    def handle(self, *args, **options):
       print('test msg') 
