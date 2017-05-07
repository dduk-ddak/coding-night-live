OS := $(shell uname)

default: start
.PHONY: start stop uninstall

include Makefile.deps
include Makefile.prepare
include Makefile.docker


start:
	-test ! -f .prepared && make prepare
	make deps-start
	python3 manage.py runworker &
	daphne -b 0.0.0.0 -p 8001 coding_night_live.asgi:channel_layer &


stop: deps-stop
	-killall -9 daphne
	-killall -9 python3
	-killall -9 python  # FIXME: daphne at MAC OS


uninstall: clean stop deps-uninstall
