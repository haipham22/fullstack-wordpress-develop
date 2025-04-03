ARG PHP_FPM_VERSION=php8.4

FROM wordpress:${PHP_FPM_VERSION}-fpm-alpine

LABEL Maintainer="Hải Phạm <contact@haipham.net>"
LABEL Description="Lightweight container with Nginx 1.24 & PHP based on Alpine Linux."

# Setup document root
RUN mkdir -p /app

WORKDIR /app

# https://github.com/mlocati/docker-php-extension-installer
# Install packages and remove default server definition
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN chmod +x /usr/local/bin/install-php-extensions && \
    sync && \
    install-php-extensions ctype redis curl dom gd intl mbstring mysqli opcache openssl phar session xml memcached xmlreader && \
    apk add --no-cache curl nginx supervisor && \
    rm -rf /var/cache/apk/*

# Use the default production configuration for PHP-FPM ($PHP_INI_DIR variable already set by the default image)
# Configure PHP-FPM
COPY docker/php/php-fpm.d/zz-docker.conf /usr/local/etc/php-fpm.d/zz-docker.conf
COPY docker/php/php-fpm.d/fpm-pool.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/php-config.d/php.ini /usr/local/etc/php/conf.d/custom.ini

# Configure nginx - http
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
# Configure nginx - default server
COPY docker/nginx/conf.d /etc/nginx/conf.d/

# Configure supervisord
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf


# Make sure files/folders needed by the processes are accessable when they run under the www-data user
RUN chown -R www-data /app /run /var/lib/nginx /var/log/nginx

COPY wp-cli.yml /app/wp-cli.yml

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch to use a non-root user from here on
USER www-data

# Add application
COPY --chown=www-data . /app/
