import os
import sys

# Check OS
platform = sys.platform
if platform == 'win32' or platform == 'win64':
    print('Error: Cannot run in Windows..')
    exit(0)

if platform == 'linux':
    cmd = 'python3'
else:
    cmd = 'python'

# Check Python Version (3 or 2)
if sys.version_info[0] == 2:
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
os.system('%s secret_key_gen.py'%cmd)
os.system('%s manage.py migrate'%cmd)

# Admin user setting
os.system('%s manage.py createsuperuserauto'%cmd)

