# RapRanger Backend

Backend API per RapRanger sviluppato con NestJS e TypeScript.

## Prerequisiti

- Node.js >= 20
- PostgreSQL 15
- npm o yarn

## Installazione

```bash
npm install
```

## Configurazione

Copia `.env.example` in `.env` e configura le variabili d'ambiente:

```bash
cp .env.example .env
```

## Sviluppo

```bash
# Sviluppo con hot-reload
npm run start:dev

# Build
npm run build

# Produzione
npm run start:prod
```

## Database

Le migrazioni TypeORM sono gestite tramite script npm:

```bash
# Genera nuova migrazione
npm run migration:generate -- -n MigrationName

# Esegui migrazioni
npm run migration:run

# Rollback ultima migrazione
npm run migration:revert
```

## Test

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Docker

```bash
# Build immagine
docker build -t rapranger-backend .

# Run container
docker run -p 3000:3000 --env-file .env rapranger-backend
```

## Health Check

L'endpoint `/api/health` è disponibile per verificare lo stato dell'applicazione:

- `GET /api/health` - Health check base
- `GET /api/health/detailed` - Health check dettagliato con info sistema

## Architettura

Il progetto segue l'architettura modulare NestJS:

```
src/
├── main.ts              # Entry point
├── app.module.ts        # Root module
├── database/            # Database module (TypeORM)
├── health/              # Health check module
└── ...                  # Altri moduli (auth, workouts, etc.)
```

## Note

- **MAI** impostare `synchronize: true` in produzione
- Usare sempre migrazioni per modifiche schema
- Validare sempre input con class-validator
- Logging strutturato per produzione

