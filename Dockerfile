#FROM ubuntu:14.04
FROM python
ENV PYTHONUNBUFFERED 1

#RUN apt-get -y update
#RUN apt-get -y upgrade
#RUN apt-get install -y gcc vi
#RUN apt-get install -y nginx gcc vi

RUN mkdir -p /opt/coding-night-live
WORKDIR /opt/coding-night-live
#ADD requirements.txt /opt/coding-night-live
ADD . /opt/coding-night-live
#COPY . /opt/coding-night-live

#RUN echo "daemon off;" >> /etc/nginx/nginx.conf
#RUN rm -rf /etc/nginx/sites-enabled/default
#ADD coding-night-live_nginx.conf /etc/nginx/sites-enabled/coding-night-live_nginx.conf
#RUN ln -s ./coding-night-live_nginx.conf /etc/nginx/sites-enabled/

RUN pip install -r requirements.txt
RUN python secret_key_gen.py
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate
EXPOSE 8000

