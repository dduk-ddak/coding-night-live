export POSTGRES_USER=cnluser
export POSTGRES_PASSWORD=temporary
export POSTGRES_DB=codingnightlive

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
	sudo su postgres -c 'dropdb $(POSTGRES_DB)'
	sudo su postgres -c 'dropuser $(POSTGRES_USER)'

resize:
	sudo -u postgres psql $(POSTGRES_DB) -c "ALTER TABLE socialaccount_socialapp ALTER COLUMN name TYPE character varying(65);"

settings:
	sudo su postgres -c 'createdb $(POSTGRES_DB)'
	sudo -u postgres psql -c "CREATE USER $(POSTGRES_USER) WITH PASSWORD '$(POSTGRES_PASSWORD)';"
	sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $(POSTGRES_DB) TO $(POSTGRES_USER);"
	sudo -u postgres -E ./init_sql.sh
