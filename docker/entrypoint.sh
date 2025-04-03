#!/bin/sh

# Đường dẫn thư mục cài đặt WordPress
WP_PATH="/app"

# Kiểm tra nếu thư mục WordPress chưa có, thì tải về
# if [ ! -f "$WP_PATH/wp-config.php" ]; then
#     echo "WordPress chưa được cài đặt. Đang tải..."
#     wp core download --path="$WP_PATH" --allow-root
# fi

# Chạy lệnh mặc định của container
exec "$@"
