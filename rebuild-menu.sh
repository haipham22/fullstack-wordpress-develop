#!/bin/sh
set -e
wp menu create "All Pages" >/dev/null

# top-level pages
for p in $(wp post list --post_type=page --post_status=publish --posts_per_page=200 --field=ID --post_parent=0); do
  wp menu item add-post all-pages "$p" >/dev/null
done

# child pages, attached under their parent's menu item
for p in $(wp db query "SELECT ID FROM wp_posts WHERE post_type='page' AND post_status='publish' AND post_parent <> 0 ORDER BY post_parent, ID" --skip-column-names); do
  pid=$(wp post meta get "$p" _wp_page_parent 2>/dev/null || wp db query "SELECT post_parent FROM wp_posts WHERE ID=$p" --skip-column-names)
  pitem=$(wp menu item list all-pages --fields=db_id,object_id --format=csv | tail -n +2 | grep ",$pid$" | cut -d, -f1 | head -1)
  if [ -n "$pitem" ]; then
    wp menu item add-post all-pages "$p" --parent-id="$pitem" >/dev/null
    echo "child $p under parent $pid"
  fi
done

wp menu location assign all-pages primary_navigation
echo '--- structure ---'
wp menu item list all-pages --fields=title,db_id,menu_item_parent --format=table | head -25
