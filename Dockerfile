FROM docker.io/bitpoke/wordpress-runtime:bedrock-php-8.3.14 AS builder

COPY composer.json .
COPY composer.lock .

RUN composer install --prefer-dist --no-scripts --no-dev --no-autoloader

COPY . .

RUN composer dump-autoload --no-scripts --no-dev --optimize

# Set appropriate permissions
# RUN chown -R www-data:www-data /app

FROM builder AS runtime
# COPY --from=builder --chown=www-data:www-data /app /app
COPY --from=builder /app /app

ENV PORT=80

EXPOSE $PORT

