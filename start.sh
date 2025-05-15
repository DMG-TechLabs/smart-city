#!/usr/bin/env bash

set -e

python3 dummy/main.py &

./pocketbase serve --http=0.0.0.0:8090 &

npm run dev

