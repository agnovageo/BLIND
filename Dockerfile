# Stage 1: Build de la SPA React + Vite + Tailwind
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Stage 2: Servidor estático Nginx en modo no-root (puerto interno 8080)
FROM nginx:1.27-alpine AS runtime

# Ajustar permisos para ejecutar Nginx con el usuario no privilegiado 'nginx'
RUN mkdir -p /var/cache/nginx /var/run/nginx /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx /tmp/nginx /usr/share/nginx/html && \
    sed -i '/^user /d' /etc/nginx/nginx.conf && \
    sed -i 's|/var/run/nginx.pid|/tmp/nginx/nginx.pid|g' /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
