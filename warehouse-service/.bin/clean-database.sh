#!/usr/bin/env bash

cd $(dirname $0)/../

rm -rvf ./database.sqlite

echo "INFO: Initial database"
sqlite3 database.sqlite < database/initial.sql

echo "INFO: Database seeds"
sqlite3 database.sqlite < database/seeds.sql