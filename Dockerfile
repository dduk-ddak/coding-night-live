FROM python
ENV PYTHONUNBUFFERED 1

run apt-get -y update
run apt-get -y upgrade
run apt-get install -y build-essential
run apt-get install -y nginx supervisor vim

#nginx
run apt-get install -y python-software-properties
run apt-get update
RUN apt-get install -y nginx

RUN mkdir -p /opt/coding-night-live
WORKDIR /opt/coding-night-live

#ADD requirements.txt /opt/coding-night-live
ADD . /opt/coding-night-live
#COPY . /opt/coding-night-live
run ln -s ./coding-night-live_nginx.conf /etc/nginx/sites-enabled/

RUN pip install -r requirements.txt
RUN python secret_key_gen.py

#EXPOSE 8000
EXPOSE 80
