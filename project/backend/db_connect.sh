#!/usr/bin/env bash
docker exec -it $(docker ps | grep -E 'backend_db\s' | awk '{ print $1 }') psql -U docker -d gis -h localhost
