# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia file dipendenze
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Installa dipendenze
RUN npm ci --only=production && npm cache clean --force

# Copia codice sorgente
COPY . .

# Build applicazione
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Installa solo runtime dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia build da stage builder
COPY --from=builder /app/dist ./dist

# Crea utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]

