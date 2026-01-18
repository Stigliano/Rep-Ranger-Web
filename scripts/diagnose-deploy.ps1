# scripts/diagnose-deploy.ps1

# Configurazione (basata sui log rilevati)
$PROJECT_ID = "raprenger-web"
$REGION = "europe-west1"
$BACKEND_SERVICE = "rapranger-backend-prod"

Write-Host "Diagnostica Deploy RepRanger"

# 1. Verifica e Setup GCloud
Write-Host "1. Verifica Connessione GCP..."
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $PROJECT_ID) {
    Write-Host "Il progetto attivo è '$currentProject'. Imposto '$PROJECT_ID'..."
    gcloud config set project $PROJECT_ID
} else {
    Write-Host "Progetto attivo corretto: $PROJECT_ID"
}

# 2. Analisi Servizio Cloud Run
Write-Host "2. Analisi Servizio Cloud Run ($BACKEND_SERVICE)..."
# Recupera info su ultima revisione e stato - usando apici singoli per evitare conflitti PowerShell
gcloud run services describe $BACKEND_SERVICE --region $REGION --format='table(status.latestReadyRevision, status.traffic, status.conditions)'

# 3. Controllo Log di Errore (Cruciale per il crash loop)
Write-Host "3. Controllo Errori Applicativi (Ultimi 5 minuti)..."
Write-Host "Sto cercando errori critici (Severity >= ERROR)..."

# Filtra log di Cloud Run per errori
$logFilter = "resource.type=cloud_run_revision AND resource.labels.service_name=$BACKEND_SERVICE AND severity>=ERROR"
# usando apici singoli per evitare conflitti PowerShell
gcloud logging read $logFilter --limit 10 --format='table(timestamp, textPayload)'

# 4. Controllo GitHub Actions
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "4. Controllo GitHub Actions (CI/CD)..."
    # Lista le ultime 3 run del workflow di backend
    gh run list --workflow "Backend CI/CD" --limit 3
} else {
    Write-Host "GitHub CLI non installata o non autenticata. Salto controllo CI/CD."
}

Write-Host "Diagnostica completata."
