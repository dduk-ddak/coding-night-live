FROM python
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /opt/coding-night-live
WORKDIR /opt/coding-night-live

ADD requirements.txt /opt/coding-night-live
RUN pip install -r requirements.txt
COPY . /opt/coding-night-live

#nginx
#RUN apt-ger install -y nginx
#ADD ln -s coding-night-live_nginx.conf /etc/nginx/site-enabled/

EXPOSE 8000
