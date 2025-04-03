#!/bin/sh

# Đường dẫn thư mục cài đặt WordPress
WP_PATH="/app"

# If - wordpress is not installed, download it
if [ ! -f "$WP_PATH/wp-config.php" ]; then
    echo "Running WordPress installation..."
    wp core download --path="$WP_PATH" --allow-root
fi

# Chạy lệnh mặc định của container
exec "$@"
