# Deployment Progress Tracker

## Obiettivo
Portare l'applicazione RepRanger (Backend + Frontend) online su Google Cloud Platform utilizzando GitHub Actions per la CI/CD.

## Stato Attuale
- [x] Analisi codebase iniziale
- [x] Individuazione infrastruttura Terraform (GCP)
- [ ] Verifica configurazione GitHub Actions
    - **STATUS**: Autenticazione WIF configurata e funzionante.
    - **RISULTATO**: `terraform plan` eseguito con successo.
    - **ATTENZIONE**: `terraform apply` è stato saltato (skipped). Questo accade spesso se l'environment "production" richiede approvazione manuale su GitHub o se le condizioni `if` non sono soddisfatte, ma qui sembra tutto corretto (`refs/heads/main` e `push`).
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
1. Indagare perché `terraform apply` è stato skippato (controllare configurazione Environment su GitHub).
2. Configurare Environment "production" su GitHub Settings -> Environments se non esiste.
