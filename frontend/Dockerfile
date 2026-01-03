# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia file dipendenze
COPY package*.json ./

# Installa dipendenze
RUN npm ci && npm cache clean --force

# Copia codice sorgente
COPY . .

# Build applicazione
RUN npm run build

# Stage 2: Production (Nginx)
FROM nginx:alpine

# Copia build da stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configurazione Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

