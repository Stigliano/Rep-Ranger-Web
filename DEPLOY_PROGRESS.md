# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **ERRORE**: Il workflow `Terraform Infrastructure` ha fallito nel job `terraform fmt -check` sul file `cloud-run.tf`.
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
1. Risolvere l'errore di formattazione in `infrastructure/cloud-run.tf`.
2. Verificare che la pipeline GitHub Actions passi correttamente.
3. Configurare le credenziali e i segreti necessari per GitHub Actions.
