import sys
import json

from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.utils.crypto import get_random_string

from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    def system_check(self):
        # win32 / win64 / linux(Ubuntu)
        print(sys.platform)

    def open_secret(self):
        print('* Please write your OAuth Client ID')
        client_id = input('>')
        print('** Please write your OAuth Secret')
        secret = input('>')
        print('*** Please write your Server Domain (ex. example.com)')
        domain = input('>')

        chars = 'qwertyuiopasdfghjklzxcvbnm0987654321!@#$%^&*(-_=+)'
        SECRET_KEY = get_random_string(50, chars)

        result = {}

        result['CLIENT_ID'] = str(client_id)
        result['SECRET'] = str(secret)
        result['DOMAIN'] = str(domain)
        result['SECRET_KEY'] = SECRET_KEY

        with open('secret.json', 'w') as f:
            json.dump(result, f)
        with open('secret.json', 'r') as f:
            secret = json.loads(f.read())
            self.social_app_setting(secret['DOMAIN'], secret['CLIENT_ID'], secret['SECRET'])

    def social_app_setting(self, domain, client_id, secret):
        default_site_1 = Site.objects.get(id=1)
        default_site_1.domain = domain
        default_site_1.name = domain
        default_site_1.save()

        new_social_app = SocialApp(
            id=1,
            provider='google',
            name=domain,
            client_id=client_id,
            secret=secret,
            key='',
        )

        new_social_app.save()
        new_social_app.sites.add(default_site_1)
        new_social_app.save()
    
    def handle(self, *args, **options):
        self.system_check()
        self.open_secret()
