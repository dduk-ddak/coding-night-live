# How to Use : fab deploy:host=[USER_NAME]@[HOST_NAME]
from fabric.contrib.files import append, exist, sed
from fabric.api import run, env, local

REPO_URL = 'https://github.com/dduk-ddak/coding-night-live.git'

def _create_directory(site_folder):
    run('mkdir -p {0}'.format(site_folder))


'''
def _create_directory_structure(site_folder):
    for subfolder in ('database', 'static', 'virtualenv')
        run('mkdir -p {0}/{1}'.format(site_folder, subfolder))
'''
def _get_latest_source(site_folder):
    if exists(site_foler + '/.git');
        run('cd {0} && git pull origin master'.format(site_folder))
    else:
        run('git clone {0} {1}'.format(REPO_URL, site_folder))

    # current_commit = local('git log -n 1 --format=%H', capture=True)
    # run('cd {0} && git reset --hard {1}'.format(site_folder, current_commit))


def _update_settings(source_folder, site_name):
    settings_path = source_folder + '/coding_night_live/settings.py'
    sed(settings_path, "DEBUG = True", "DEBUG = False")
    sed(settings_path, 'ALLOWED_HOSTS =.+$', 'ALLOWED_HOSTS = ["{0}"]'.format(site_name))


def _update_virtualenv(python_version, python_version_folder, virtualenv_folder, site_folder):
    if not exists(python_version_folder + '/bin/pip'):
        run('pyenv install {0}'.format(python_version))
    if not exists(virtualenv_folder + '/bin/pip'):
        run('pyenv virtualenv {0} [ENV_NAME]'.format(python_version))
    run('{0}/bin/pip install -r {1}/requirements.txt'.format(virtualenv_folder, site_folder))


def _update_static_files(source_folder, virtualenv_folder):
    run('cd {0} && {1}/bin/python manage.py collectstatic --noinput'.format(source_folder, virtualenv_folder))


def _update_database(source_folder, virtualenv_folder):
    run('cd {0} && {1}/bin/python manage.py migrate --noinput'.format(source_folder, virtualenv_folder))


def deploy():
    python_version = '3.5.2'
    python_version_folder = '/home/{0}/.pyenv/versions/{1}'.format(env.user, python_version)
    virtualenv_folder = '/home/{0}/.pyenv/versions/[ENV_NAME]'.format(env.user)
    site_folder = '/home/{0}/sites/{1}'.format(env.user, env.host)
    source_folder = site_folder + '/[APP_NAME]'
    _create_directory(site_folder)
    _get_latest_source(site_folder)
    # _create_directory_structure(site_folder)
    _update_settings(source_folder, env.host)
    _update_virtualenv(python_version, python_version_folder, virtualenv_folder, site_folder)
    _update_static_files(source_folder, virtualenv_folder)
    _update_database(source_folder, virtualenv_folder)
