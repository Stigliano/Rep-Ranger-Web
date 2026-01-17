# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [x] Verifica configurazione GitHub Actions
    - **STATUS**: Autenticazione WIF, Backend GCS e Deploy Infra funzionanti.
- [x] Verifica configurazione Docker
    - **STATUS**: Build funzionanti.
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
    - **STATUS**: Pronto.
- [x] Deploy Infrastruttura
    - **STATUS**: Completato. Infrastruttura operativa.
- [ ] Deploy Applicazione
    - **STATUS**: ⚠️ Verifica Fallita (2026-01-07).
        - **Frontend**: ✅ Operativo. URL: `https://rapranger-frontend-prod-6911179946.europe-west1.run.app`
        - **Backend**: ❌ Offline / Placeholder. URL: `https://rapranger-backend-prod-6911179946.europe-west1.run.app`
    - **PROBLEMA**: Nonostante il deploy riportato come "successo", l'endpoint `/api/health` continua a restituire la pagina "Congratulations" (Revision `rapranger-backend-prod-00001-p8m`).
    - **ANALISI (2026-01-17)**:
        1. **URL API Errato**: Il frontend puntava al backend senza `/api` finale.
        2. **CORS**: Configurazione `credentials: true` con `origin: '*'` causava errori CORS.
    - **RISOLUZIONE (2026-01-17)**:
        - **Backend**: Aggiornato `backend/src/main.ts` per gestire CORS in modo più robusto (credentials condizionale).
        - **Infrastruttura**: Aggiornato `infrastructure/cloud-run.tf` per correggere `VITE_API_BASE_URL` (aggiunto suffisso `/api`).
        - **Stato**: Fix applicati, in attesa di redeploy.

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. **Push & Deploy**: Committare le modifiche per triggerare la pipeline CI/CD.
2. **Monitoraggio**: Controllare i log di Cloud Run durante il deployment per verificare che la nuova revisione del backend vada online correttamente.
3. **Smoke Test Finale**: Verificare login e funzionalità base su ambiente live.
