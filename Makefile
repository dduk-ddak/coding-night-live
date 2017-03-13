OS := $(shell uname)

default: start

sudo:
	sudo -v

start: prepare sudo
ifeq ($(OS),Linux)
	sudo service redis-server start
else
	redis-server &
endif
	python3 manage.py runworker &
	daphne -b 0.0.0.0 -p 8001 coding_night_live.asgi:channel_layer &
ifeq ($(OS),Linux)
	sudo service nginx start  # FIXME
else
endif

db.sqlite3:
	python3 manage.py migrate

pw.txt: db.sqlite3
	python3 manage.py createsuperuserauto

collected_static/:
	yes yes | python3 manage.py collectstatic

secret.json: db.sqlite3
	python3 manage.py autodeploy

nginx/local_nginx.conf: secret.json
	python3 manage.py nginxconfgenerator > nginx/local_nginx.conf

prepare-nginx: sudo nginx/local_nginx.conf
	sudo rm -f /etc/nginx/sites-enabled/local_nginx.conf
	sudo ln -s `pwd`/nginx/local_nginx.conf /etc/nginx/sites-enabled/

prepare: \
		deps-install\
		db.sqlite3\
		pw.txt\
		collected_static/\
		secret.json\
		nginx/local_nginx.conf\
		prepare-nginx\



deps-install:
ifeq ($(OS),Linux)
	sudo apt-get install redis-server
	sudo apt-get install nginx
else
	echo 'ACITON REQUIRED) Need to install redis and nginx before this.'
endif

stop: sudo
	-sudo service nginx stop
	-sudo killall -9 daphne  # FIXME
	-sudo killall -9 python3  # FIXME
	-sudo service redis-server stop

clean:
	-rm secret.json db.sqlite3
	-rm -r collected_static

uninstall: stop clean
