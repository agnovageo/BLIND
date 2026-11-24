FROM node:22-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node server.ts ./server.ts

USER node
EXPOSE 8080

CMD ["node", "server.ts"]
