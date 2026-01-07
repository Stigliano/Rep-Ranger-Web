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
        - **Frontend**: ✅ Completato con successo.
        - **Backend**: ❌ Fallito startup (Port Binding).
    - **CAUSA**: Il container ascoltava su localhost invece di 0.0.0.0. (Log: `failed to start and listen on the port`).
    - **SOLUZIONE**:
        1. Fix applicato: Binding su 0.0.0.0 e rimozione healthcheck interno.
        2. Da verificare: Connessione DB (secret placeholder).

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
