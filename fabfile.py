import os
import json
import random

from fabric.contrib.files import append, exists, sed, put
from fabric.context_managers import cd
from fabric.api import env, local, sudo, run

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(PROJECT_DIR)

with open(os.path.join(PROJECT_DIR, 'deploy.json')) as f:
    envs = json.loads(f.read())

REPO_URL = envs['REPO_URL']
PROJECT_NAME = envs['PROJECT_NAME']
REMOTE_HOST_SSH = envs['REMOTE_HOST_SSH']
REMOTE_HOST = envs['REMOTE_HOST']
REMOTE_USER = envs['REMOTE_USER']
REMOTE_PASSWORD = envs['REMOTE_PASSWORD']
SERVER_DOMAIN = envs['SERVER_DOMAIN']

STATIC_ROOT_NAME = 'collected_static'
STATIC_URL_NAME = 'static'

env.user = REMOTE_USER
username = env.user
env.hosts = [
    REMOTE_HOST_SSH,
]

env.password = REMOTE_PASSWORD

project_folder = '/home/{}/{}'.format(env.user, PROJECT_NAME)

apt_requirements = [
    'git',
    'python3-dev',
    'python3-pip',
    'build-essential',
    'python3-setuptools',
    'nginx',
    'postgresql',
    'postgresql-contrib',
    'redis-server',
    'libzmq-dev',
    'libevent-dev',
]

def new_server():
    setup()
    deploy()

def setup():
    _get_latest_apt()
    _install_apt_requirements(apt_requirements)

def deploy():
    _get_latest_source()
    _install_python_packages()
    _update_static_files()
    _update_database()
    _make_virtualhost()
    _make_circus()
    _grant_nginx()
    _restart_nginx()
    _start_circusd()

    _autodeploy()
    _createsuperuserauto()

def _get_latest_apt():
    sudo('sudo apt-get update && sudo apt-get -y upgrade')

def _install_apt_requirements(apt_requirements):
    reqs = ''
    for req in apt_requirements:
        reqs += (' ' + req)
    sudo('sudo apt-get -y install {}'.format(reqs))

def _get_latest_source():
    #run('git clone %s %s' % (REPO_URL, project_folder))
    run('git clone %s %s -b fabric' % (REPO_URL, project_folder))

def _install_python_packages():
    with cd(project_folder):
        sudo('sudo pip3 install -r requirements.txt')

def _update_settings():
    settings_path = project_folder + '/{}/settings.py'.format(PROJECT_NAME)
    sed(settings_path, 'DEBUG = TRUE', 'DEBUG = FALSE')
    sed(settings_path,
        'ALLOWED_HOSTS = .+$',
        'ALLOWED_HOSTS = ["%s"]' % (REMOTE_HOST,)
    )

def _update_static_files():
    with cd(project_folder):
        run('python3 manage.py collectstatic --noinput')

def _update_database():
    with cd(project_folder):
        run('make prepare-postgresql')
        run('python3 manage.py migrate --noinput')

def _autodeploy():
    with cd(project_folder):
        run('python3 manage.py autodeploy')

def _createsuperuserauto():
    with cd(project_folder):
        run('python3 manage.py createsuperuserauto')

# nginx conf file..
def _make_virtualhost():
    nginx_conf = '''
    server {
        listen 80;
        server_name %s;
        charset utf-8;
        client_max_body_size 20M;

        location /static/ {
            alias %s/collected_static/;
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
    ''' % (SERVER_DOMAIN, project_folder)

    f = open(project_folder + '/coding-night-live_nginx.conf', 'w')
    f.write(nginx_conf)
    f.close()

def _grant_nginx():
    sudo('sudo ln -s ' + project_folder + '/coding-night-live_nginx.conf /etc/nginx/sites-enabled/')

def _restart_nginx():
    sudo('sudo systemctl restart nginx')

def _make_circus():
    circus_conf = '''
    [watcher:daphne]
    cmd = daphne -b 0.0.0.0 -p 8001 coding_night_live.asgi:channel_layer
    working_dir = %s/
    copyy_env = True
    user = %s

    [watcher:worker]
    cmd = python3 manage.py runworker
    working_dir = %s/
    copy_env = True
    user = www-data

    [watcher:redis]
    cmd = redis-server
    copy_env = True
    user = %s
    ''' % (project_folder, REMOTE_USER, project_folder, REMOTE_USER)

    f = open(project_folder + '/circus.ini', 'w')
    f.write(circus_conf.replace('    ', ''))
    f.close()

def _start_circusd():
    with cd(project_folder):
        sudo('sudo nohup circusd --daemon ./circus.ini')
