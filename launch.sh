#! /usr/bin/env sh

mkdir data_a
mkdir data_b

mongod --storageEngine=inMemory --dbpath="$(pwd)/data_a" --port=2390  --logpath="$(pwd)/data_a/mongod.log" &
echo "$!" > a.pid
mongod --storageEngine=inMemory --dbpath="$(pwd)/data_b" --port=2391  --logpath="$(pwd)/data_b/mongod.log" &
echo "$!" > b.pid

wait
