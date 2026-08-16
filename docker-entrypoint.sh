#!/bin/sh

envsubst '${VITE_API_URL}' \
  < /usr/share/nginx/html/env.js \
  > /usr/share/nginx/html/env.js.tmp

mv /usr/share/nginx/html/env.js.tmp \
   /usr/share/nginx/html/env.js

exec "$@"