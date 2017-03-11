import os
import sys

# Check Os
platform = sys.platform
if platform == 'win32' or platform == 'win64':
    print('Error: Cannot run in Windows..')
    exit(0)

# Check Python Version (3 or 2)
if sys.version_info[0] == 2:
    print('Error: Cannot run in Python2.x..')
    exit(0)

# Delete files
os.system('rm -rf pw.txt')
os.system('rm -rf secret.json')
os.system('rm -rf db.sqlite3')
os.system('rm -rf collected_static')

# Stop the services
os.system('service redis-server stop')
os.system('service nginx stop')

# Kill the processes
os.system('sudo killall -9 daphne')
os.system('sudo killall -9 redis-server')
os.system('sudo killall -9 python3')
