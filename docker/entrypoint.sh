#!/bin/sh

# Đường dẫn thư mục cài đặt WordPress
WP_PATH="/app"

# If - wordpress is not installed, download it
if [ ! -f "$WP_PATH/wp-includes/version.php" ]; then
    echo "Running WordPress installation..."
    wp core download --allow-root
fi

# Chạy lệnh mặc định của container
exec "$@"
