from django.core.management.base import BaseCommand
from django.conf import settings
from django.template import Template, Context

from .autodeploy import loadSecret


NGINX_CONF_TEMPLATE = Template('''
# <NOTICE> /etc/nginx/ may not your nginx installation path. please check your installation path before.

# You need to run the script below!
# sudo ln -s coding-night-live/coding-night-live_nginx.conf /etc/nginx/sites-enabled/
# ex) sudo ln -s /home/punk/coding-night-live/collected_static /etc/nginx/sites-enabled/

server {
  listen 80;
  server_name {{ SERVER_NAME }};
  charset utf-8;
  client_max_body_size 20M;

  location /static/ {
    alias {{ BASE_DIR }}/collected_static/;
  }

  location / {
    proxy_pass http://0.0.0.0:8001;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $server_name;
  }
}
''')


def _dontBelieve(conf, key, _defaultValue):
    believableValue = conf.get(key, None)
    if believableValue:
        return believableValue
    return _defaultValue


class Command(BaseCommand):
    def handle(self, *args, **options):
        secret = loadSecret()
        variables = Context({
            'BASE_DIR': settings.BASE_DIR,
            'SERVER_NAME': _dontBelieve(secret, 'DOMAIN', 'localhost'),
            'PROXY_PASS': None,
            'PORT': None,
        })
        self.stdout.write(NGINX_CONF_TEMPLATE.render(variables))
