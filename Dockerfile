FROM node:16-alpine AS node

FROM node AS node-with-gyp
RUN apk add g++ make python3

FROM node-with-gyp AS builder
WORKDIR /squid
ADD package.json .
ADD package-lock.json .
RUN npm ci
RUN npx patch-package
ADD tsconfig.json .
ADD src src
RUN npm run build

FROM node-with-gyp AS deps
WORKDIR /squid
ADD package.json .
ADD package-lock.json .
RUN npm ci --production
RUN npx patch-package

FROM node AS squid
WORKDIR /squid
COPY --from=deps /squid/package.json .
COPY --from=deps /squid/package-lock.json .
COPY --from=deps /squid/node_modules node_modules
COPY --from=builder /squid/lib lib
ADD db db
ADD assets assets
ADD schema.graphql .
# TODO: use shorter PROMETHEUS_PORT
ENV PROCESSOR_PROMETHEUS_PORT 3000
EXPOSE 3000
EXPOSE 4000

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Выполнение миграций для processor
FROM squid AS processor
#RUN npx squid-typeorm-migration apply  # Применение миграций
CMD ["npm", "run", "processor:start"]  # Запуск процессора

# Выполнение миграций для query-node
FROM squid AS query-node
#RUN npx squid-typeorm-migration apply  # Применение миграций
CMD ["sh", "-c", "npm run query-node:start & npm run processor:start"]  # Запуск GraphQL сервера
