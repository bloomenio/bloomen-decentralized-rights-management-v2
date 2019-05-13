FROM nginx:stable-alpine

RUN apk update && \
    apk add apache2-utils 
    

ADD conf/nginx.conf /etc/nginx/nginx.conf
ADD etc/local-8000-service.conf /etc/nginx/conf.d/local-8000-service.conf
ADD etc/public-443-service.conf /etc/nginx/conf.d/public-443-service.conf
ADD etc/solr-service.srv /etc/nginx/conf.d/solr-service.srv
ADD etc/api-service.srv /etc/nginx/conf.d/api-service.srv


ADD script/entrypoint.sh /entrypoint.sh
ADD script/le.sh /le.sh

RUN \
 rm /etc/nginx/conf.d/default.conf && \
 chmod +x /entrypoint.sh && \
 chmod +x /le.sh && \
 apk add  --update certbot tzdata openssl && \
 rm -rf /var/cache/apk/*

CMD ["/entrypoint.sh"]
