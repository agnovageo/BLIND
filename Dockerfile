# Stage 1: Build de la SPA React + Vite + Tailwind (glibc para binarios nativos de Vite 8 y Tailwind v4)
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build

# Stage 2: Servidor estático Nginx oficial sin privilegios root (puerto interno 8080)
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
