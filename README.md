# RepRanger Web

Applicazione web per il tracking intelligente degli allenamenti, sviluppata per atleti intermedi/avanzati.

## Architettura

- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 15 (Cloud SQL)
- **Infrastructure**: Google Cloud Platform (Terraform)
- **CI/CD**: GitHub Actions

## Struttura Progetto

```
.
├── infrastructure/    # Terraform per GCP
├── backend/          # API NestJS
├── frontend/         # React App
└── doc/              # Documentazione completa
```

## Quick Start

### Sviluppo Locale

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura .env con credenziali database locale
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Deployment

Vedi [doc/2_INFRASTRUCTURE.md](doc/2_INFRASTRUCTURE.md) per la guida completa al setup e deployment su Google Cloud Platform.

## Documentazione

La documentazione completa è disponibile in `doc/`:

- `1_HIGH_LEVEL_ANALYSIS.md` - Analisi high-level e obiettivi
- `2_INFRASTRUCTURE.md` - Architettura infrastrutturale GCP, Setup e Deployment Guide
- `3_SOFTWARE_ARCHITECTURE.md` - Architettura software
- `4_FEATURE_SPECS.md` - Specifiche funzionalità
- `5_DB_ARCHITECTURE.md` - Architettura database
- `6_FRONTEND_INTERFACE.md` - Interfaccia frontend

## Tecnologie

### Backend
- NestJS 10
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query
- Zustand
- React Router
- Axios

### Infrastructure
- Google Cloud Platform
- Terraform
- Cloud Run
- Cloud SQL
- Cloud Storage
- Artifact Registry

## CI/CD

Il progetto utilizza GitHub Actions per CI/CD automatico:

- **Backend**: Build, test e deploy su Cloud Run
- **Frontend**: Build, test e deploy su Cloud Run
- **Infrastructure**: Validazione e applicazione Terraform

## Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## License

MIT

## Supporto

Per problemi o domande, consulta la documentazione in `doc/` o apri un issue su GitHub.
