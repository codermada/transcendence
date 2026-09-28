#!/bin/bash

set -e

if [ "$NODE_ENV" = "production" ]; then
    echo "Start Frontend PROD mode"
    npm run build
    exec npm run start
else
    echo "Start Frontend DEV mode"
    exec npm run dev
fi
