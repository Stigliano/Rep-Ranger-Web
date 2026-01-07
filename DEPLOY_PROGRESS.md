# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **STATUS**: Autenticazione, Backend GCS e Import risorse manuali completati.
    - **FIX**: Corretto typo in `artifact-registry.tf`.
    - **PERMESSI**: API Serverless VPC Access abilitata e permessi Owner assegnati.
    - **IMPORT**: Service Accounts backend/frontend importati nello stato.
    - **PLAN**: `terraform plan` locale ora ha successo (18 add, 2 change, 0 destroy).
- [ ] Verifica configurazione Docker
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
    - **STATUS**: Pronto.
- [ ] Deploy Infrastruttura
    - **STATUS**: In attesa di esecuzione CI/CD finale.
- [ ] Deploy Applicazione

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. Pushare la correzione del typo in `artifact-registry.tf`.
2. Monitorare il job `terraform apply` nella CI (dovrebbe finalmente passare).
