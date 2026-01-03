# Infrastructure as Code - RapRanger

Questo modulo Terraform definisce l'infrastruttura completa per RapRanger su Google Cloud Platform.

## Prerequisiti

1. **Google Cloud SDK** installato e configurato
2. **Terraform** >= 1.5.0 installato
3. **Autenticazione GCP** configurata:
   ```bash
   gcloud auth application-default login
   ```
4. **Abilitazione API** necessarie:
   ```bash
   gcloud services enable \
     compute.googleapis.com \
     sqladmin.googleapis.com \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     storage.googleapis.com \
     secretmanager.googleapis.com \
     servicenetworking.googleapis.com \
     cloudkms.googleapis.com
   ```

## Struttura

- `main.tf`: Provider e configurazione base
- `variables.tf`: Variabili configurabili
- `outputs.tf`: Output dell'infrastruttura
- `network.tf`: VPC, subnet, NAT, firewall
- `database.tf`: Cloud SQL PostgreSQL
- `storage.tf`: Cloud Storage buckets
- `artifact-registry.tf`: Repository Docker
- `iam.tf`: Service accounts e permessi
- `secrets.tf`: Secret Manager
- `cloud-run.tf`: Servizi Cloud Run

## Utilizzo

### Inizializzazione

```bash
cd infrastructure
terraform init
```

### Pianificazione

```bash
terraform plan -var="project_id=raprenger-web"
```

### Applicazione

```bash
terraform apply -var="project_id=raprenger-web"
```

### Distruzione (ATTENZIONE!)

```bash
terraform destroy -var="project_id=raprenger-web"
```

## Variabili Principali

- `project_id`: ID progetto GCP (default: `raprenger-web`)
- `region`: Regione GCP (default: `europe-west1`)
- `environment`: Ambiente (dev, staging, prod)
- `db_tier`: Tier Cloud SQL (default: `db-f1-micro`)

## Note Importanti

1. **Cloud SQL Private IP**: Il database è accessibile solo dalla VPC (non esposto su internet)
2. **Backup Automatici**: Abilitati con retention 30 giorni
3. **Encryption**: Tutti i dati sono criptati at-rest
4. **Least Privilege**: Service accounts con permessi minimi necessari

## Costi Stimati (mensili)

- Cloud SQL (db-f1-micro): ~$10-15
- Cloud Run: Pay-per-use (~$0-50 in base al traffico)
- Cloud Storage: ~$0.02/GB
- NAT Gateway: ~$45/mese
- **Totale stimato**: ~$60-120/mese per ambiente base

