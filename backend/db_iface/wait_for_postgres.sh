#!/bin/sh
# wait-for-postgres.sh

set -e

host="$1"
shift
cmd="$@"

POSTGRES_PASSWORD="docker"
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "docker" -d "gis" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "docker" -d "gis" -c '\i z_init.sql';
if PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "docker" -d "gis" -c '\dt' | grep -q cb_2017_us_zcta510_500k; then
  echo "Zip codes already exist"

else
  echo "Zip codes do not exist"
  gunzip z_shp.sql.gz
  PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "docker" -d "gis" -c '\i z_shp.sql';
  gzip z_shp.sql
fi
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "docker" -d "gis" -c '\dt';
exec $cmd
