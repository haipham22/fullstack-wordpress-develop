FROM haipham22/nginx-php-fpm:8.3-fpm-alpine

USER root

COPY --from=wordpress:cli /usr/local/bin/wp /usr/local/bin/

# Use the default production configuration for PHP-FPM ($PHP_INI_DIR variable already set by the default image)
RUN echo "[Memory Limit]" >> "$PHP_INI_DIR/php.ini"
RUN echo "memory_limit = 256M;" >> "$PHP_INI_DIR/php.ini"

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch to use a non-root user from here on
USER www-data

# Add application
COPY --chown=www-data . /app/
