from .settings_base import *


DEBUG = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'codingnightlive',
        'USER': 'cnluser',
        'PASSWORD': 'temporary',    # Need to change
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': '',
    }
}

