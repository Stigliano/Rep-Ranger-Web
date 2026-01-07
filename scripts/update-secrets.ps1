# Script per aggiornare i Secret di Produzione su Google Cloud Platform
# Richiede gcloud CLI installato e autenticato (gcloud auth login)

$ProjectID = "raprenger-web"
$Env = "prod"

Write-Host "=== RepRanger Secret Updater ===" -ForegroundColor Cyan
Write-Host "Questo script aggiornerà i secret su GCP per il progetto: $ProjectID" -ForegroundColor Yellow
Write-Host "Assicurati di essere loggato con 'gcloud auth login'" -ForegroundColor Gray
Write-Host ""

# Funzione helper per aggiornare un secret
function Update-Secret {
    param (
        [string]$SecretName,
        [string]$PromptMessage
    )

    $SecretFullName = "rapranger-$SecretName-$Env"
    
    Write-Host "Aggiornamento secret: $SecretFullName" -ForegroundColor Green
    $SecretValue = Read-Host -Prompt $PromptMessage -AsSecureString
    $SecretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretValue))

    if ([string]::IsNullOrWhiteSpace($SecretPlain)) {
        Write-Host "Valore vuoto, salto l'aggiornamento di $SecretFullName." -ForegroundColor Yellow
        return
    }

    Write-Host "Caricamento nuova versione su Secret Manager..."
    $SecretPlain | gcloud secrets versions add $SecretFullName --data-file=- --project=$ProjectID

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Secret aggiornato con successo!" -ForegroundColor Green
    } else {
        Write-Host "Errore durante l'aggiornamento del secret." -ForegroundColor Red
    }
    Write-Host ""
}

# 1. Database Password
Update-Secret -SecretName "db-password" -PromptMessage "Inserisci la Password del Database (DB_PASSWORD)"

# 2. JWT Secret
Update-Secret -SecretName "jwt-secret" -PromptMessage "Inserisci il JWT Secret (min 32 caratteri)"

# 3. JWT Refresh Secret
Update-Secret -SecretName "jwt-refresh-secret" -PromptMessage "Inserisci il JWT Refresh Secret (min 32 caratteri)"

Write-Host "=== Aggiornamento completato ===" -ForegroundColor Cyan
Write-Host "NOTA: Cloud Run utilizzerà le nuove versioni 'latest' al prossimo deploy o riavvio."
Write-Host "Per applicare subito, puoi riavviare il servizio backend dalla console GCP."

