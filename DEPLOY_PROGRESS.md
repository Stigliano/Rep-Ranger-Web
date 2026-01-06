# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **ERRORE**: Fallimento autenticazione GCP. Errore: `google-github-actions/auth failed with: the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"`.
    - **AZIONE**: Configurare Workload Identity Federation (WIF) per evitare l'uso di chiavi JSON.
- [ ] Verifica configurazione Docker
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
- [ ] Deploy Infrastruttura
- [ ] Deploy Applicazione

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. Aggiornare i workflow GitHub Actions per utilizzare Workload Identity Federation.
2. Verificare la configurazione Terraform per WIF (`infrastructure/wif.tf`).
3. Pushare le modifiche e monitorare la pipeline.
