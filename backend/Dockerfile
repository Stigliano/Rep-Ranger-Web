# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia file dipendenze
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Installa dipendenze (incluse devDependencies per la build)
RUN npm ci && npm cache clean --force

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

CMD ["node", "dist/src/main.js"]

