#!/bin/bash
## desc: health-station-frontend deploy

# delete dist backup
if [ -d "./dist.bak" ]; then
  rm -rf dist.bak/
fi

# dist backup
if [ -d "./dist" ]; then
  cp -r dist/ dist.bak
  rm -rf dist/
fi

# update dist
mv dist_new dist

app_name='hs-frontend'

mapfile -t running_container_array < <(docker ps --format "{{.Names}}")

echo "${running_container_array[@]}" | grep -wq ${app_name} &&
  (echo '---- container already running, restart container ----' && docker restart ${app_name}) ||
  (echo '---- run container ----' && docker-compose up -d)
