FROM nginx

RUN rm -rf /etc/nginx/conf.d/default
RUN rm -rf /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/
COPY docker_nginx.conf /etc/nginx/conf.d/
EXPOSE 80

