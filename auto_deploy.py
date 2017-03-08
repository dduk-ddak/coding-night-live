import os
import sys
os.environ['DJANGO_SETTINGS_MODULE'] = 'coding_night_live.settings'

import django
from django.conf import settings
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

def system_check():
    # win32 / win64 / ...
    print(sys.platform)

def social_app_setting(domain, name, client_id, secret):
    default_site_1 = Site.objects.get(id=1)
    default_site_1.domain = 'localhost:8000'    # TODO
    default_site_1.name = 'localhost:8000'    # TODO
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

def get_secret():
    secret_file = os.path.join(BASE_DIR, 'secret.json')
    with open(secret_file, 'r') as f:
        secret = json.loads(f.read())
    
    try:
        return secret['SECRET_KEY']
    except KeyError:
        error_msg = "Set the {0} environment variable".format('SECRET_KEY')
        raise ImproperlyConfigured(error_msg)

if __name__ == '__main__':
    django.setup()
    settings.configure()
    secret_key = get_secret()
    print('test msg')
