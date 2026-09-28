FROM node:24.20.0

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
