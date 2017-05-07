FROM python
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /opt/coding-night-live
WORKDIR /opt/coding-night-live
ADD requirements.txt /opt/coding-night-live
RUN pip install -r requirements.txt

ADD . /opt/coding-night-live
RUN python manage.py collectstatic --noinput

EXPOSE 8000
