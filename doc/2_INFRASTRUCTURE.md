# Infrastruttura Cloud e Guida Operativa - RapRanger Web

**Versione:** 2.0.0  
**Data Ultima Revisione:** 2024-12-19  
**Autore:** Team RapRanger

---

## 1. Introduzione

Questo documento descrive l'architettura infrastrutturale completa per la Web App RapRanger su **Google Cloud Platform (GCP)**, inclusa la configurazione cloud, CI/CD, containerizzazione, monitoraggio e procedure operative di setup e deployment.

### 1.1 Scopo del Documento

- Definire l'architettura cloud GCP e hosting
- Fornire guida completa al setup iniziale dell'ambiente
- Specificare la configurazione CI/CD con GitHub Actions
- Descrivere procedure di deployment manuale e automatico
- Definire monitoraggio, logging e alerting
- Stabilire procedure di backup, manutenzione e disaster recovery

### 1.2 Principi Guida

- **Scalabilità:** Architettura in grado di scalare automaticamente in base al carico
- **Affidabilità:** Uptime >99.5% con ridondanza e failover automatico
- **Sicurezza:** Compliance con standard industriali (SOC 2, ISO 27001)
- **Costi:** Ottimizzazione costi con right-sizing e pay-per-use
- **Manutenibilità:** Infrastruttura as Code (IaC) per versionamento e riproducibilità

---

## 2. Architettura Cloud GCP

### 2.1 Panoramica Architetturale

L'architettura segue il pattern **Microservices-Ready Monolith** con separazione chiara tra frontend, backend e database. L'infrastruttura è implementata su **Google Cloud Platform**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Load Balancing                      │
│              SSL Termination, Health Checks                  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐      ┌──────────▼──────────┐
    │   Frontend (Cloud   │      │   Backend (Cloud     │
    │   Run)              │      │   Run)               │
    │   - React App       │      │   - NestJS API       │
    │   - Auto-scaling    │      │   - Auto-scaling     │
    └──────────────────────┘      └──────────┬───────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │   Database (Cloud SQL        │
                              │   PostgreSQL)                │
                              │   - Private IP               │
                              │   - Automated Backups        │
                              └──────────────────────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │   Storage (Cloud Storage)     │
                              │   - User Photos              │
                              │   - Reports/Exports          │
                              └──────────────────────────────┘
```

### 2.2 Provider Cloud: Google Cloud Platform

**Scelta:** Google Cloud Platform come provider principale.

**Perché GCP:**
- **Cloud Run:** Serverless containers con auto-scaling e pay-per-use
- **Cloud SQL:** Database gestito PostgreSQL con backup automatici
- **Artifact Registry:** Repository Docker integrato
- **Secret Manager:** Gestione sicura delle credenziali
- **Compliance:** Certificazioni multiple (SOC 2, ISO 27001, HIPAA)
- **Integrazione:** Ecosistema integrato per CI/CD e monitoring

### 2.3 Componenti Infrastrutturali

#### 2.3.1 Frontend Hosting: Cloud Run

**Configurazione:**
- **Servizio:** Cloud Run (serverless containers)
- **Container:** React app buildata e servita via Nginx
- **Auto-scaling:** Da 0 a N istanze in base al traffico
- **SSL:** Gestito automaticamente da Cloud Run

**Perché Cloud Run:**
- **Serverless:** Nessuna gestione di server o cluster
- **Scalabilità:** Auto-scaling da 0 a migliaia di istanze
- **Costi:** Pay-per-use, paghi solo per le richieste effettive
- **Sicurezza:** Isolamento automatico tra container
- **Deploy:** Integrazione nativa con CI/CD

**Configurazione Dettagliata:**
```yaml
Cloud Run Service:
  - Name: rapranger-frontend-prod
  - Region: europe-west1
  - CPU: 1 vCPU
  - Memory: 512 MB
  - Min Instances: 0 (scalabile a 0)
  - Max Instances: 10
  - Concurrency: 80 requests per instance
  - Timeout: 300s
  - SSL: Managed (automatico)
```

#### 2.3.2 Backend Hosting: Cloud Run

**Configurazione:**
- **Servizio:** Cloud Run (serverless containers)
- **Container:** NestJS API
- **Auto-scaling:** Basato su richieste HTTP
- **VPC Connector:** Per accesso a Cloud SQL via Private IP

**Perché Cloud Run:**
- **Semplicità:** Nessuna gestione di server, solo container
- **Sicurezza:** Isolamento automatico tra container
- **Costi:** Pay-per-use, più efficiente per carichi variabili
- **Scalabilità:** Auto-scaling più semplice e veloce rispetto a GKE

**Configurazione Dettagliata:**
```yaml
Cloud Run Service:
  - Name: rapranger-backend-prod
  - Region: europe-west1
  - CPU: 2 vCPU
  - Memory: 2 GB
  - Min Instances: 1 (per ridurre cold start)
  - Max Instances: 20
  - Concurrency: 80 requests per instance
  - Timeout: 300s
  - VPC Connector: Enabled (per Cloud SQL Private IP)
```

#### 2.3.3 Database: Cloud SQL PostgreSQL

**Configurazione:**
- **Engine:** PostgreSQL 15.x
- **Instance Type:** db-f1-micro (scalabile)
- **Private IP:** Enabled (non esposto su internet)
- **Backup:** Automated daily, retention 30 giorni
- **High Availability:** Opzionale (per produzione critica)

**Perché Cloud SQL:**
- **Gestione Automatica:** Backup, patching, monitoring gestiti da GCP
- **Sicurezza:** Private IP, encryption at-rest, VPC isolation
- **Performance:** Performance Insights integrato
- **Costi:** Pay-per-use con opzioni di risparmio

**Configurazione Dettagliata:**
```yaml
Cloud SQL Instance:
  - Engine: PostgreSQL 15.4
  - Instance Type: db-f1-micro (1 vCPU, 0.6 GB RAM)
  - Storage: 20 GB SSD (auto-scaling fino a 100 GB)
  - Private IP: Enabled
  - Public IP: Disabled (sicurezza)
  - Backup:
    - Automated: Daily at 03:00 UTC
    - Retention: 30 days
  - Encryption: AES-256 at-rest
  - Maintenance Window: Sun 04:00-05:00 UTC
```

#### 2.3.4 Storage: Cloud Storage

**Configurazione:**
- **Bucket:** rapranger-user-files-prod
- **Versioning:** Enabled
- **Lifecycle Policies:** 
  - Move to Coldline dopo 90 giorni
  - Delete dopo 7 anni (compliance)
- **Encryption:** AES-256 server-side encryption

**Perché Cloud Storage:**
- **Durabilità:** 99.999999999% (11 nines)
- **Scalabilità:** Illimitata
- **Costi:** Pay-per-use, molto economico
- **Access Control:** IAM policies granulari

**Configurazione Dettagliata:**
```yaml
Cloud Storage Bucket Structure:
  - photos/: User profile photos, workout photos
  - reports/: Generated PDF/CSV reports
  - exports/: User data exports (GDPR)

Lifecycle Rules:
  - Photos: 
    - Move to Coldline after 90 days
    - Delete after 7 years
  - Reports:
    - Delete after 1 year
  - Exports:
    - Delete after 30 days
```

#### 2.3.5 Container Registry: Artifact Registry

**Configurazione:**
- **Registry:** Artifact Registry (Docker)
- **Repository:** rapranger-docker-repo
- **Image Scanning:** Automatic vulnerability scanning
- **Lifecycle Policies:** Rimozione automatica immagini vecchie

**Perché Artifact Registry:**
- **Integrazione:** Integrazione nativa con Cloud Run
- **Sicurezza:** Scanning automatico vulnerabilità
- **Performance:** Edge locations per pull veloci
- **Costi:** Pay-per-use, molto economico

### 2.4 Networking e Sicurezza

#### 2.4.1 VPC Configuration

**Architettura:**
- **VPC:** Isolamento completo dalla rete pubblica
- **Subnets:** 
  - Public Subnets: Cloud Run, Load Balancer
  - Private Subnets: Cloud SQL (Private IP)
- **VPC Connector:** Per connessione Cloud Run → Cloud SQL
- **Firewall Rules:** Regole granulari per sicurezza

**Perché questa architettura:**
- **Sicurezza:** Database in subnet private, non accessibile da internet
- **High Availability:** Multi-region support
- **Scalabilità:** Facile aggiungere nuove subnet/regioni

#### 2.4.2 SSL/TLS

**Configurazione:**
- **Certificate:** Google-managed SSL certificates
- **Protocol:** TLS 1.2+ only
- **HSTS:** Enabled (Strict-Transport-Security header)

**Perché Google-managed:**
- **Gratuito:** Nessun costo per certificati
- **Auto-Renewal:** Rinnovo automatico
- **Integrazione:** Integrazione nativa con Cloud Run

---

## 3. Setup Ambiente Iniziale

### 3.1 Prerequisiti

Prima di iniziare, assicurati di avere installato:

1. **Google Cloud SDK** (gcloud CLI)
   ```bash
   # Verifica installazione
   gcloud --version
   ```

2. **Terraform** >= 1.5.0
   ```bash
   # Verifica installazione
   terraform --version
   ```

3. **Docker** (per build locali)
   ```bash
   # Verifica installazione
   docker --version
   ```

4. **Node.js** >= 20 (per sviluppo locale)
   ```bash
   # Verifica installazione
   node --version
   ```

### 3.2 Configurazione Iniziale GCP

#### 3.2.1 Autenticazione Google Cloud

```bash
# Login interattivo
gcloud auth login

# Imposta progetto di default
gcloud config set project raprenger-web

# Configura application-default credentials (per Terraform)
gcloud auth application-default login
```

#### 3.2.2 Abilitazione API Necessarie

Abilita tutte le API richieste dal progetto:

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

#### 3.2.3 Service Account per CI/CD

Crea un service account dedicato per GitHub Actions:

```bash
# Crea service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD"

# Assegna ruolo Editor (o ruoli più granulari se necessario)
gcloud projects add-iam-policy-binding raprenger-web \
  --member="serviceAccount:github-actions@raprenger-web.iam.gserviceaccount.com" \
  --role="roles/editor"

# Genera chiave JSON
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@raprenger-web.iam.gserviceaccount.com
```

**Importante:** Aggiungi il contenuto di `github-actions-key.json` come secret `GCP_SA_KEY` in GitHub (Settings → Secrets and variables → Actions).

---

## 4. Gestione Infrastruttura (Infrastructure as Code)

### 4.1 Struttura Terraform

Il modulo Terraform si trova in `infrastructure/` e definisce l'intera infrastruttura:

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

### 4.2 Utilizzo Terraform

#### 4.2.1 Inizializzazione

```bash
cd infrastructure
terraform init
```

#### 4.2.2 Pianificazione

Verifica le modifiche prima di applicarle:

```bash
terraform plan -var="project_id=raprenger-web"
```

#### 4.2.3 Applicazione

Crea/modifica le risorse:

```bash
terraform apply -var="project_id=raprenger-web"
```

**ATTENZIONE**: Questo creerà risorse a pagamento su GCP. Verifica i costi stimati prima di procedere.

#### 4.2.4 Distruzione (ATTENZIONE!)

Elimina tutte le risorse create:

```bash
terraform destroy -var="project_id=raprenger-web"
```

**ATTENZIONE**: Questo eliminerà TUTTE le risorse, inclusi database e dati. Usa con estrema cautela.

### 4.3 Variabili Principali

- `project_id`: ID progetto GCP (default: `raprenger-web`)
- `region`: Regione GCP (default: `europe-west1`)
- `environment`: Ambiente (dev, staging, prod)
- `db_tier`: Tier Cloud SQL (default: `db-f1-micro`)

### 4.4 Note Importanti

1. **Cloud SQL Private IP**: Il database è accessibile solo dalla VPC (non esposto su internet)
2. **Backup Automatici**: Abilitati con retention 30 giorni
3. **Encryption**: Tutti i dati sono criptati at-rest
4. **Least Privilege**: Service accounts con permessi minimi necessari

---

## 5. Guida al Deployment

### 5.1 Configurazione Secrets

Dopo il deployment dell'infrastruttura, configura i secret in Secret Manager:

```bash
# Password database
echo -n "your-secure-password" | gcloud secrets versions add rapranger-db-password-prod --data-file=-

# JWT Secret
echo -n "your-jwt-secret" | gcloud secrets versions add rapranger-jwt-secret-prod --data-file=-

# JWT Refresh Secret
echo -n "your-jwt-refresh-secret" | gcloud secrets versions add rapranger-jwt-refresh-secret-prod --data-file=-

# Audit Encryption Key
echo -n "your-audit-encryption-key" | gcloud secrets versions add rapranger-audit-encryption-key-prod --data-file=-
```

#### 5.1.1 Aggiornamento Password Database

Aggiorna la password dell'utente database in Cloud SQL:

```bash
gcloud sql users set-password rapranger_app \
  --instance=rapranger-db-prod \
  --password=your-secure-password
```

### 5.2 Database Setup

#### 5.2.1 Esecuzione Migrazioni

Le migrazioni TypeORM devono essere eseguite manualmente la prima volta:

**Opzione 1: Locale (sviluppo)**
```bash
cd backend
npm install
npm run migration:run
```

**Opzione 2: Cloud Run Job (consigliato per produzione)**
```bash
# Crea Cloud Run Job per migrazioni
gcloud run jobs create migration-job \
  --image=europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/backend:latest \
  --region=europe-west1 \
  --set-env-vars="DB_HOST=/cloudsql/[CONNECTION_NAME],DB_NAME=rapranger,DB_USER=rapranger_app" \
  --set-secrets="DB_PASSWORD=rapranger-db-password-prod:latest" \
  --add-cloudsql-instances=[CONNECTION_NAME] \
  --command="npm" \
  --args="run,migration:run"

# Esegui job
gcloud run jobs execute migration-job --region=europe-west1
```

### 5.3 Deployment Applicazione

#### 5.3.1 Opzione 1: Via GitHub Actions (Consigliato)

Il deployment automatico è configurato tramite GitHub Actions:

1. Push su branch `main` o `develop` triggera automaticamente:
   - Build immagine Docker
   - Push su Artifact Registry
   - Deploy su Cloud Run

**Configurazione GitHub Actions:**
- Secret `GCP_SA_KEY`: Chiave JSON del service account
- Secret `GCP_PROJECT_ID`: ID progetto GCP
- Secret `GCP_REGION`: Regione GCP (es. `europe-west1`)

#### 5.3.2 Opzione 2: Deployment Manuale

##### Backend

```bash
cd backend

# Build immagine Docker
docker build -t europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/backend:latest .

# Autenticazione Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Push immagine
docker push europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/backend:latest

# Deploy Cloud Run
gcloud run deploy rapranger-backend-prod \
  --image=europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/backend:latest \
  --region=europe-west1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="DB_PASSWORD=rapranger-db-password-prod:latest,JWT_SECRET=rapranger-jwt-secret-prod:latest" \
  --add-cloudsql-instances=[CONNECTION_NAME]
```

##### Frontend

```bash
cd frontend

# Build immagine Docker
docker build -t europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/frontend:latest .

# Autenticazione Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Push immagine
docker push europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/frontend:latest

# Deploy Cloud Run
gcloud run deploy rapranger-frontend-prod \
  --image=europe-west1-docker.pkg.dev/raprenger-web/rapranger-docker-repo/frontend:latest \
  --region=europe-west1 \
  --platform=managed \
  --allow-unauthenticated
```

### 5.4 Verifica Deployment

#### 5.4.1 Health Check Backend

```bash
curl https://[BACKEND_SERVICE_URL]/api/health
```

#### 5.4.2 Verifica Frontend

Apri il browser e visita l'URL del servizio frontend Cloud Run.

#### 5.4.3 Logs

```bash
# Backend logs
gcloud run services logs read rapranger-backend-prod --region=europe-west1

# Frontend logs
gcloud run services logs read rapranger-frontend-prod --region=europe-west1
```

---

## 6. Manutenzione e Troubleshooting

### 6.1 Aggiornamento Database

#### 6.1.1 Generazione Migrazioni

```bash
cd backend
npm run migration:generate -- -n MigrationName
```

#### 6.1.2 Esecuzione Migrazioni

```bash
# Locale
npm run migration:run

# Produzione (via Cloud Run Job)
gcloud run jobs execute migration-job --region=europe-west1
```

### 6.2 Backup Database

I backup automatici sono configurati in Terraform. Per backup manuale:

```bash
# Backup manuale
gcloud sql backups create --instance=rapranger-db-prod

# Lista backup
gcloud sql backups list --instance=rapranger-db-prod

# Restore da backup
gcloud sql backups restore [BACKUP_ID] --backup-instance=rapranger-db-prod
```

### 6.3 Rollback

Per rollback a versione precedente di Cloud Run:

```bash
# Lista revisioni
gcloud run revisions list --service=rapranger-backend-prod --region=europe-west1

# Rollback a revisione specifica
gcloud run services update-traffic rapranger-backend-prod \
  --to-revisions=[REVISION_NAME]=100 \
  --region=europe-west1
```

### 6.4 Troubleshooting

#### Problema: Cloud Run non si connette a Cloud SQL

**Verifica:**
1. VPC connector configurato correttamente
2. Cloud SQL instance ha Private IP abilitato
3. Service account ha permesso `cloudsql.client`
4. Cloud Run service ha `--add-cloudsql-instances` configurato

**Soluzione:**
```bash
# Verifica VPC connector
gcloud compute networks vpc-access connectors list

# Verifica Cloud SQL Private IP
gcloud sql instances describe rapranger-db-prod

# Verifica permessi service account
gcloud projects get-iam-policy raprenger-web
```

#### Problema: Secret non trovato

**Verifica che il secret esista e sia accessibile:**
```bash
# Lista secret
gcloud secrets list

# Verifica accesso secret
gcloud secrets versions access latest --secret=rapranger-db-password-prod

# Verifica permessi Cloud Run service account
gcloud run services describe rapranger-backend-prod --region=europe-west1
```

#### Problema: Build Docker fallisce

**Verifica:**
1. Dockerfile corretto
2. Dipendenze installate correttamente
3. Variabili d'ambiente configurate
4. Autenticazione Artifact Registry

**Soluzione:**
```bash
# Test build locale
docker build -t test-image ./backend

# Verifica autenticazione
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

#### Problema: Cloud Run service non risponde

**Verifica:**
1. Health check endpoint funzionante
2. Logs per errori
3. Configurazione variabili d'ambiente
4. Connessione database

**Soluzione:**
```bash
# Verifica logs
gcloud run services logs read rapranger-backend-prod --region=europe-west1 --limit=50

# Verifica configurazione
gcloud run services describe rapranger-backend-prod --region=europe-west1
```

---

## 7. Monitoraggio e Logging

### 7.1 Cloud Logging

**Configurazione:**
- **Log Groups:** Automatici per ogni servizio Cloud Run
- **Retention:** 30 giorni (configurabile)
- **Log Levels:** DEBUG (staging), INFO (production)
- **Structured Logging:** JSON format per parsing facile

**Query Logs:**
```bash
# Logs backend
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=rapranger-backend-prod" --limit=50

# Logs frontend
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=rapranger-frontend-prod" --limit=50
```

### 7.2 Cloud Monitoring

**Metriche Monitorate:**
- **Request Count:** Numero di richieste per servizio
- **Latency:** Tempo di risposta (p50, p95, p99)
- **Error Rate:** Percentuale di errori
- **CPU/Memory:** Utilizzo risorse
- **Database:** Connection pool, query performance

**Dashboard:**
Crea dashboard personalizzati in Cloud Console per monitorare:
- Health generale dell'applicazione
- Performance database
- Utilizzo risorse
- Errori e eccezioni

### 7.3 Alerting

**Alert Configurati:**
- **High Error Rate:** >5% errori per 5 minuti
- **High Latency:** p95 >1s per 5 minuti
- **Low Availability:** <99% uptime
- **Database Issues:** Connection errors, slow queries

**Configurazione Alert:**
```bash
# Crea alert policy via gcloud o Cloud Console
# Esempio: Alert su error rate alto
gcloud alpha monitoring policies create --notification-channels=[CHANNEL_ID] \
  --display-name="High Error Rate" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

---

## 8. Backup e Disaster Recovery

### 8.1 Database Backups

**Configurazione:**
- **Automated Backups:** Daily at 03:00 UTC
- **Retention:** 30 giorni
- **Point-in-Time Recovery:** Enabled (ultimi 7 giorni)
- **Cross-Region:** Opzionale per disaster recovery

**Perché questa strategia:**
- **RPO (Recovery Point Objective):** 24 ore (acceptable per dati non critici)
- **RTO (Recovery Time Objective):** <1 ora (con restore da backup)
- **Compliance:** Retention 30 giorni per audit

### 8.2 Application Data Backups

**Configurazione:**
- **Cloud Storage Versioning:** Enabled per tutti i bucket
- **Lifecycle Policies:** Move to Coldline dopo 90 giorni
- **Cross-Region Replication:** Opzionale per bucket critici

**Perché questa strategia:**
- **Durabilità:** 11 nines di durabilità con versioning
- **Costi:** Coldline per storage a lungo termine
- **Compliance:** Retention 7 anni per dati utente (GDPR)

### 8.3 Disaster Recovery Plan

**Scenario 1: Service Failure**
- **Mitigazione:** Auto-scaling e health checks
- **Recovery:** Failover automatico a nuova istanza
- **RTO:** <5 minuti (automatico)

**Scenario 2: Region Failure**
- **Mitigazione:** Multi-region deployment (opzionale)
- **Recovery:** 
  1. Deploy servizi in regione diversa
  2. Restore database da backup cross-region
  3. Update DNS per puntare a nuova regione
- **RTO:** <2 ore (manuale)

**Scenario 3: Data Corruption**
- **Mitigazione:** Point-in-time recovery (Cloud SQL)
- **Recovery:** Restore a timestamp specifico
- **RTO:** <1 ora

---

## 9. Sicurezza

### 9.1 Network Security

- **VPC:** Isolamento completo
- **Private IP:** Database accessibile solo da VPC
- **Firewall Rules:** Regole granulari (least privilege)
- **Cloud Armor:** Protezione DDoS su Load Balancer (opzionale)

### 9.2 Data Encryption

- **In Transit:** TLS 1.2+ everywhere
- **At Rest:** 
  - Cloud SQL: Encryption enabled
  - Cloud Storage: Server-side encryption (AES-256)
  - Secrets: Secret Manager encryption

### 9.3 Access Control

- **IAM:** Least privilege principle
- **Secrets Management:** Secret Manager per credenziali
- **MFA:** Obbligatorio per accesso GCP console
- **Audit Logging:** Cloud Audit Logs per tutte le azioni

### 9.4 Compliance

- **GDPR:** 
  - Data encryption
  - Right to erasure (export/delete)
  - Audit logging
- **SOC 2:** GCP è certificato SOC 2
- **ISO 27001:** GCP è certificato ISO 27001

---

## 10. Costi Stimati

### 10.1 Costi Mensili (Stima)

**Infrastructure:**
- Cloud Run (Backend + Frontend): ~$0-50/mese (pay-per-use)
- Cloud SQL (db-f1-micro): ~$10-15/mese
- Cloud Storage (100 GB): ~$2/mese
- Artifact Registry: ~$1/mese
- VPC Connector: ~$10/mese
- **Totale Infrastructure:** ~$25-80/mese

**Servizi Gestiti:**
- Cloud Logging: ~$5-10/mese
- Secret Manager: ~$1/mese
- Cloud Monitoring: ~$5/mese
- **Totale Servizi:** ~$11-16/mese

**Totale Stimato:** ~$35-100/mese per ambiente produzione base

**Nota:** Costi possono variare significativamente in base a:
- Traffico reale
- Storage utilizzato
- Numero di utenti attivi
- Configurazione auto-scaling

### 10.2 Ottimizzazione Costi

- **Right-Sizing:** Monitorare utilizzo e ridimensionare se necessario
- **Lifecycle Policies:** Move to Coldline per dati vecchi
- **Reserved Capacity:** Per Cloud SQL (opzionale, commitment 1-3 anni)
- **Min Instances:** Impostare a 0 per servizi non critici (riduce costi)

---

## 11. Conclusioni

L'infrastruttura proposta fornisce:

1. **Scalabilità:** Auto-scaling automatico in base al carico
2. **Affidabilità:** Uptime >99.5% con backup automatici
3. **Sicurezza:** Compliance con standard industriali
4. **Manutenibilità:** Infrastructure as Code per versionamento
5. **Costi:** Ottimizzati con pay-per-use e right-sizing

Le scelte tecnologiche (GCP, Cloud Run, Cloud SQL, Artifact Registry) sono allineate con:
- Standard industriali per ambienti critici
- Requisiti di performance e affidabilità
- Esigenze di compliance normativa
- Budget ragionevole per startup/small business

**Prossimi Passi:**
1. Setup account GCP e configurazione iniziale
2. Creazione repository GitHub con workflow CI/CD
3. Deploy ambiente staging
4. Testing end-to-end
5. Deploy produzione

---

## 12. Riferimenti

- **Documento High-Level:** `1_HIGH_LEVEL_ANALYSIS.md`
- **Documento Architettura Software:** `3_SOFTWARE_ARCHITECTURE.md`
- **GCP Documentation:** https://cloud.google.com/docs
- **Terraform GCP Provider:** https://registry.terraform.io/providers/hashicorp/google/latest/docs
- **GitHub Actions Documentation:** https://docs.github.com/en/actions

---

**Approvato da:** _________________  
**Data Approvazione:** _________________
