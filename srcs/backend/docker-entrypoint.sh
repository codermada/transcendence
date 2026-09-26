#!/bin/bash

set -e

npx prisma generate

npx prisma migrate deploy

npm run create-admin

if [ "${NODE_ENV}" = "prod" ]; then
	echo "Start Backend PROD mode"
	npm run build
	exec npm run start:prod
else
	echo "Start Backend DEV mode"
	exec npm run start:dev
fi
