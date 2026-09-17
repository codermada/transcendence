#!/bin/sh

set -e

npx prisma generate

npx prisma migrate deploy

npm run create-admin

exec npm run start:dev