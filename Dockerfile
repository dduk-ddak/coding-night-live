FROM python
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /opt/coding-night-live
WORKDIR /opt/coding-night-live
ADD . /opt/coding-night-live

RUN pip install -r requirements.txt
RUN python secret_key_gen.py
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate
EXPOSE 8000

