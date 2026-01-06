# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **ERRORE**: Autenticazione fallita per Project ID/Number errato (`951012369656` invece di `6911179946`).
    - **AZIONE**: Aggiornare i workflow con il Project Number corretto (`6911179946`).
- [ ] Verifica configurazione Docker
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
    - **STATUS**: WIF Bootstrap completato manualmente.
- [ ] Deploy Infrastruttura
- [ ] Deploy Applicazione

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. Aggiornare i file YAML dei workflow con il corretto `workload_identity_provider`.
2. Pushare le modifiche e verificare la pipeline.
