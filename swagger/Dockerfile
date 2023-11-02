FROM node:20-alpine3.17 AS base
COPY . /app
RUN corepack enable
WORKDIR /app

RUN pnpm install
ENV NODE_ENV=dev

EXPOSE 8002
CMD [ "pnpm", "start" ]
