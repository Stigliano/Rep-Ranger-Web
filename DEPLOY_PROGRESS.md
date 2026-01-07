# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **STATUS**: Risolti problemi di autenticazione in `terraform-validate` e conflitti di risorse.
    - **BACKEND**: Configurato backend GCS remoto.
    - **IMPORT**: Risorse WIF e Service Account importate con successo nello stato remoto.
    - **API**: Abilitate manualmente.
- [ ] Verifica configurazione Docker
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
    - **STATUS**: WIF Bootstrap e API Enablement completati.
- [ ] Deploy Infrastruttura
    - **STATUS**: Bucket GCS creato. Pronto per il deploy.
- [ ] Deploy Applicazione

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. Monitorare la pipeline CI/CD dopo il fix sull'autenticazione nel job `terraform-validate`.
2. Verificare che il deploy dell'infrastruttura vada a buon fine.
