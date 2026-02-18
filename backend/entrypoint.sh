#!/bin/sh
set -e

mkdir -p /data

# se não existe ou está vazio, copia o seed
if [ ! -s /data/app.db ]; then
  echo "Seeding /data/app.db ..."
  cp /app/seed/app.db /data/app.db
fi

exec java -jar /app/app.jar