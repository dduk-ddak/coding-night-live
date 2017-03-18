OS := $(shell uname)

default: start
.PHONY: start stop clean uninstall prepare prepare-nginx deps-install

sudo:
	sudo -v

start: \.prepared deps-start
	# Django
	python3 manage.py runworker &
	daphne -b 0.0.0.0 -p 8001 coding_night_live.asgi:channel_layer &

deps-start: sudo
ifeq ($(OS),Linux)
	sudo service redis-server start
else ifeq ($(OS),Darwin)
	brew services run redis
else
	sudo redis-server &
endif
ifeq ($(OS),Linux)
	sudo service nginx start
else ifeq ($(OS),Darwin)
	sudo brew services run nginx
else
	sudo nginx &
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
ifeq ($(OS),Linux)
	sudo rm -f /etc/nginx/sites-enabled/local_nginx.conf
	sudo ln -s `pwd`/nginx/local_nginx.conf /etc/nginx/sites-enabled/
else ifeq ($(OS),Darwin)
	rm -f /usr/local/etc/nginx/servers/local_nginx.conf
	ln -s `pwd`/nginx/local_nginx.conf /usr/local/etc/nginx/servers/
else
	# FIXME ln -s `pwd`/nginx/local_nginx.conf /usr/local/etc/nginx/servers/
endif

prepare \.prepared: \
		deps-install\
		db.sqlite3\
		pw.txt\
		collected_static/\
		secret.json\
		nginx/local_nginx.conf\
		prepare-nginx\

	touch .prepared


deps-install:
ifeq ($(OS),Linux)
	sudo apt-get install redis-server
	sudo apt-get install nginx
else ifeq ($(OS),Darwin)
	brew list redis > /dev/null || brew install redis --build-from-source  # FIXME: Homebrew/homebrew-core#11134
	brew list nginx > /dev/null || brew install nginx
else
	echo 'ACITON REQUIRED) Need to install redis and nginx before this.'
endif

stop: sudo deps-stop
	-sudo killall -9 daphne
	-sudo killall -9 python3
	-sudo killall -9 python  # FIXME: daphne at MAC OS

deps-stop:
ifeq ($(OS),Linux)
	-sudo service nginx stop
else ifeq ($(OS),Darwin)
	-sudo brew services stop nginx
else
    -sudo killall -9 'nginx: master process nginx'
	-sudo killall -9 'nginx: worker process'
	-sudo killall -9 nginx
endif
ifeq ($(OS),Linux)
	-sudo service redis-server stop
else ifeq ($(OS),Darwin)
	-brew services stop redis
else
	-sudo killall -9 redis-server
endif

clean:
	-rm \
			secret.json\
			db.sqlite3\
			pw.txt\
			nginx/local_nginx.conf\
			.prepared\

	-rm -r collected_static

deps-uninstall: sudo
ifeq ($(OS),Linux)
    # TODO
	echo 'ACITON REQUIRED) Need to uninstall redis and nginx after this.'
else ifeq ($(OS),Darwin)
	-brew list redis > /dev/null && brew uninstall redis
	-brew list nginx > /dev/null && brew uninstall nginx
else
	echo 'ACITON REQUIRED) Need to uninstall redis and nginx after this.'
endif

uninstall: stop clean deps-uninstall
