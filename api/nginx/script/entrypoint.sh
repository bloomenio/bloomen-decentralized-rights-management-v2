#!/bin/sh

echo "add host.docker.internal to hosts"

ip -4 route list match 0/0 | awk '{print $3 " host.docker.internal"}' >> /etc/hosts  

echo "start nginx"

if [ ! -f /etc/nginx/.htpasswd ]; then
    echo "create htpasswd"
    htpasswd -bc /etc/nginx/.htpasswd ${PORTAL_USER} ${PORTAL_PASSWORD}
fi

#set TZ
cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
echo ${TZ} > /etc/timezone && \


if [ "$SSL_ENABLED" = "true" ]; then
   
	#setup ssl keys
	echo "ssl_key=${SSL_KEY:=le-key.pem}, ssl_cert=${SSL_CERT:=le-crt.pem}, ssl_chain_cert=${SSL_CHAIN_CERT:=le-chain-crt.pem}"
	SSL_KEY=/etc/nginx/ssl/${SSL_KEY}
	SSL_CERT=/etc/nginx/ssl/${SSL_CERT}
	SSL_CHAIN_CERT=/etc/nginx/ssl/${SSL_CHAIN_CERT}

	mkdir -p /etc/nginx/conf.d
	mkdir -p /etc/nginx/ssl

	#copy /etc/nginx/service*.conf if any of servcie*.conf mounted
	if [ -f /etc/nginx/service*.conf ]; then
		cp -fv /etc/nginx/service*.conf /etc/nginx/conf.d/
	fi

	#replace SSL_KEY, SSL_CERT and SSL_CHAIN_CERT by actual keys
	sed -i "s|SSL_KEY|${SSL_KEY}|g" /etc/nginx/conf.d/*.conf
	sed -i "s|SSL_CERT|${SSL_CERT}|g" /etc/nginx/conf.d/*.conf
	sed -i "s|SSL_CHAIN_CERT|${SSL_CHAIN_CERT}|g" /etc/nginx/conf.d/*.conf

	#generate dhparams.pem
	if [ ! -f /etc/nginx/ssl/dhparams.pem ]; then
		echo "make dhparams"
		cd /etc/nginx/ssl
		openssl dhparam -out dhparams.pem 2048
		chmod 600 dhparams.pem
	fi

	#disable ssl configuration and let it run without SSL
	mv -v /etc/nginx/conf.d /etc/nginx/conf.d.disabled

	(
	 sleep 5 #give nginx time to start
	 echo "start letsencrypt updater"
	 while :
	 do
		echo "trying to update letsencrypt ..."
		/le.sh
		rm -f /etc/nginx/conf.d/default.conf 2>/dev/null #remove default config, conflicting on 80
		mv -v /etc/nginx/conf.d.disabled /etc/nginx/conf.d #enable
		echo "reload nginx with ssl"
		nginx -s reload
		sleep 60d
	 done
	) &

else
    echo "ssl disabled"
	mv -v /etc/nginx/conf.d/public-443-service.conf /etc/nginx/conf.d/public-443-service.conf.disabled
fi

nginx -g "daemon off;"
