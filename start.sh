#!/usr/bin/env bash
set -e

python3 dummy/main.py &

./database/pocketbase serve --http=0.0.0.0:8090 --dir ./database/pb_data &

npm run dev
