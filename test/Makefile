all: settings logout

install:
	sudo apt-get update
	sudo apt-get install python3-dev libpq-dev postgresql postgresql-contrib

login:
	sudo su - postgres
	psql

logout:
	exit

delete:
	sudo su postgres -c 'dropdb codingnightlive'
	sudo su postgres -c 'dropuser cnluser'

settings:
	sudo su postgres -c 'createdb codingnightlive'
	sudo -u postgres psql -c "CREATE USER cnluser WITH PASSWORD 'temporary';"
	sudo -u postgres psql -c "ALTER ROLE cnluser SET client_encoding TO 'utf8';"
	sudo -u postgres psql -c "ALTER ROLE cnluser SET default_transaction_isolation TO 'read committed';"
	sudo -u postgres psql -c "ALTER ROLE cnluser SET timezone TO 'UTC-9';"
	sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE codingnightlive TO cnluser;"
