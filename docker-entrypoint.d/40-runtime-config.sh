#!/bin/sh
set -eu

envsubst '${VITE_API_BASE_URL} ${VITE_GITHUB_CLIENT_ID} ${VITE_GOOGLE_CLIENT_ID} ${VITE_GITHUB_OAUTH_AUTHORIZE_URL} ${VITE_GOOGLE_OAUTH_AUTHORIZE_URL} ${VITE_GITHUB_OAUTH_REDIRECT_URI} ${VITE_GOOGLE_OAUTH_REDIRECT_URI}' \
  < /usr/share/nginx/html/runtime-config.template.js \
  > /usr/share/nginx/html/runtime-config.js
