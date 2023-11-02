FROM node:20-alpine3.17 AS base
RUN corepack enable
COPY . /app
WORKDIR /app

RUN pnpm install
RUN pnpm build

FROM node:20-alpine3.17
RUN corepack enable
WORKDIR /app

COPY --from=base /app/node_modules node_modules
COPY --from=base /app/dist dist
COPY --from=base /app/package.json package.json
COPY --from=base /app/.env .env

ENV NODE_ENV=dev

EXPOSE 3002
CMD [ "pnpm", "start" ]
