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
    - **STATUS**: Parziale.
        - **Frontend**: ✅ Completato con successo. Disponibile a: `https://rapranger-frontend-prod-6911179946.europe-west1.run.app`
        - **Backend**: ❌ Fallito startup. URL: `https://rapranger-backend-prod-6911179946.europe-west1.run.app`
    - **ERRORE**: `The user-provided container failed to start and listen on the port defined provided by the PORT=3000... Default STARTUP TCP probe failed`
    - **CAUSA PROBABILE**:
        1. **Secret DB**: La password nel Secret Manager è "placeholder". L'applicazione crasha all'avvio tentando di connettersi al database, quindi non apre la porta 3000 in tempo per il probe di Cloud Run.
    - **SOLUZIONE RICHIESTA**:
        1. Recuperare la password del DB di produzione (o resettarla).
        2. Eseguire `./scripts/update-secrets.ps1` per aggiornare i Secret su GCP.
        3. Rilanciare il deploy (commit vuoto o re-run workflow).

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. **Aggiornare Secret**: Eseguire `./scripts/update-secrets.ps1` da terminale locale (richiede `gcloud` autenticato).
2. **Rilanciare Workflow**: Rieseguire la GitHub Action "Backend CI/CD" (o fare un push vuoto/revert) per triggerare un nuovo deploy.
3. **Smoke Test**: Verificare connettività e funzionamento base.
