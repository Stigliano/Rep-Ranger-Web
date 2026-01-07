# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **STATUS**: Risolti problemi di autenticazione e conflitti di risorse.
    - **BACKEND**: Configurato backend GCS remoto.
    - **IMPORT**: Risorse WIF e Service Account importate con successo nello stato remoto.
    - **API**: Abilitate manualmente.
- [ ] Verifica configurazione Docker
- [ ] Setup Progetto GCP (Prerequisito manuale/esterno)
    - **STATUS**: WIF Bootstrap e API Enablement completati.
- [ ] Deploy Infrastruttura
    - **STATUS**: Pronto per il deploy completo.
- [ ] Deploy Applicazione

## Dettagli Tecnici Rilevati
- **Cloud Provider**: Google Cloud Platform (GCP)
- **IaC**: Terraform
- **Backend**: NestJS (Dockerizzato)
- **Frontend**: React/Vite (Dockerizzato)
- **CI/CD**: GitHub Actions

## Prossimi Passi
1. Pushare le modifiche a `main.tf` (attivazione backend).
2. Monitorare la pipeline CI/CD: ora `terraform apply` dovrebbe funzionare senza errori di conflitto.
