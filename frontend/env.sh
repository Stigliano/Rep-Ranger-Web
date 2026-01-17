#!/bin/sh

# Line endings fix for Windows created files
# Recreate config file
rm -f /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment
echo "window.__ENV__ = {" >> /usr/share/nginx/html/env-config.js

# Read each line in .env file
# Each line represents key=value pairs
printenv | grep VITE_ | awk -F = '{ print "  \"" $1 "\": \"" $2 "\"," }' >> /usr/share/nginx/html/env-config.js

echo "}" >> /usr/share/nginx/html/env-config.js
