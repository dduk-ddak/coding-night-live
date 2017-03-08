import os
import sys

# Check OS
if sys.platform == 'win32' or sys.platform == 'win64':
    print('Error: Cannot run in Windows..')
    exit(0)

# Check Python Version (3 or 2)
PYTHON_VERSION = sys.version_info[0]
if PYTHON_VERSION == 2:
    print('Error: Cannot run in Python 2.x..')
    exit(0)

# Install python packages
try:
    import pip
except ImportError:
    print("Installing pip...")
    os.system('sudo apt-get install python3-pip')
with open('requirements.txt', 'r') as packages:
    for package in packages:
        if package[0] == '#':
            break
        pip.main(['install', package])

# DB Migration
os.system('python secret_key_gen.py')
os.system('python manage.py migrate')

# Admin user setting
os.system('python manage.py createsuperuserauto')

