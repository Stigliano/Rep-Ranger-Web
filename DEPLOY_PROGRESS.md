# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **STATUS**: Fix per `terraform fmt` committato. In attesa di esecuzione della pipeline.
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
1. Verificare l'esito della pipeline GitHub Actions dopo il commit `fix: formatting errors in cloud-run.tf`.
2. Se la pipeline passa, procedere con la verifica dei Dockerfile.
3. Configurare le credenziali e i segreti necessari per GitHub Actions.
