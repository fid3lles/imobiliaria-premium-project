#!/bin/sh
set -e

# garante estrutura base
mkdir -p /data
mkdir -p /data/propriedades
mkdir -p /app/seed

# se não existe ou está vazio, copia o seed do DB
if [ ! -s /data/app.db ]; then
  echo "Seeding /data/app.db ..."
  cp /app/seed/app.db /data/app.db
fi

# se existir seed de imagens e o destino estiver vazio, copia (sem sobrescrever uploads)
if [ -d /app/seed/propriedades ]; then
  if [ -z "$(ls -A /data/propriedades 2>/dev/null)" ]; then
    echo "Seeding /data/propriedades ..."
    cp -R /app/seed/propriedades/. /data/propriedades/
  fi
fi

exec java -jar /app/app.jar