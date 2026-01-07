# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [x] Verifica configurazione GitHub Actions
    - **STATUS**: Autenticazione WIF, Backend GCS e Deploy Infra funzionanti (con correzioni).
- [ ] Verifica configurazione Docker
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
    - **STATUS**: Pronto.
- [ ] Deploy Infrastruttura
    - **STATUS**: Completato. Infrastruttura base operativa (DB, Storage, Cloud Run con immagine placeholder).
    - **IMPORTANTE**: I secret su GCP sono stati inizializzati con valori placeholder. È necessario eseguire lo script `./scripts/update-secrets.ps1` per impostare le password reali.
- [ ] Deploy Applicazione
    - **STATUS**: In corso. Applicati fix per Linting (AvatarVisualizer commentata funzione unused, bodyTrackingService soppresso warning unused vars). Pronto per nuovo tentativo pipeline.
    - **NOTA**: Utilizzata immagine placeholder ("hello world") per sbloccare la creazione di Cloud Run. Il deploy applicativo vero sovrascriverà l'immagine.

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. **Completare Deploy Infrastruttura**: Attendere l'esito dell'ultimo fix (placeholder image).
2. **Setup Pipeline Applicativa**: Creare workflow per Build & Push Docker image e Deploy su Cloud Run.
3. **Smoke Test**: Verificare connettività e funzionamento base.
