import json
import os

from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.db.utils import OperationalError
from django.utils.crypto import get_random_string

from allauth.socialaccount.models import SocialApp


class AutoDeployException(Exception):
    pass


class AutoDeploySecretNotFound(AutoDeployException):
    pass


class AutoDeployDatabaseNotPrepared(AutoDeployException):
    @staticmethod
    def checker(suspiciousFunc):
        def _runtime_checker(*args, **kwargs):
            try:
                return suspiciousFunc(*args, **kwargs)
            except OperationalError:
                raise AutoDeployDatabaseNotPrepared('ACTION REQUIRED) RUN `python manage.py migrate` FIRST!')
        return _runtime_checker


def loadSecret():
    secret = {}
    try:
        with open('secret.json', 'r') as f:  # FIXME: PATH
            secret.update(json.loads(f.read()))
    except FileNotFoundError:
        raise AutoDeploySecretNotFound('ACITON REQUIRED) RUN `python manage.py autodeploy` FIRST!')
    return secret


class Command(BaseCommand):
    requires_migrations_checks = True

    def open_secret(self):
        client_id = os.environ.get('OAUTH_CLIENT_ID', None)
        if not client_id:
            print('* Please write your OAuth Client ID')
            client_id = input('>')
        secret = os.environ.get('OAUTH_SECRET', None)
        if not secret:
            print('** Please write your OAuth Secret')
            secret = input('>')
        domain = os.environ.get('DOMAIN', None)
        if not domain:
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

        secret = loadSecret()
        self.social_app_setting(secret['DOMAIN'], secret['CLIENT_ID'], secret['SECRET'])

    @AutoDeployDatabaseNotPrepared.checker
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
        self.open_secret()
