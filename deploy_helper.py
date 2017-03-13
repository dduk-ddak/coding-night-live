import os
import sys


# Check OS
platform = sys.platform
if platform in ('win32', 'win64'):
    print('Error: Cannot run in Windows..')
    exit(0)

cmd = 'python3'

# Check Python Version (3 or 2)
if sys.version_info[0] == 2:
    print('Error: Cannot run in Python 2.x..')
    exit(-1)

# Install python packages
try:
    import pip
except ImportError:
    print("Installing pip...")
    if platform == 'linux':
        os.system('sudo apt-get install python3-pip')
        import pip
pip.main(['install', '-r', 'requirements.txt'])

os.system('make')
