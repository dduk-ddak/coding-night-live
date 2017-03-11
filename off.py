import os

os.system('rm -rf pw.txt')
os.system('rm -rf secret.json')
os.system('rm -rf db.sqlite3')
os.system('service redis-server stop')
os.system('service nginx stop')
