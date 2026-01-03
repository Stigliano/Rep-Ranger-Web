# Script Setup Locale RepRanger
# Esegue il setup completo dell'ambiente di sviluppo locale

param(
    [switch]$SkipPrerequisites
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RepRanger - Setup Locale" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funzione per verificare prerequisiti
function Test-Prerequisites {
    $allOk = $true
    
    Write-Host "Verifica prerequisiti..." -ForegroundColor Yellow
    
    # Verifica Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
            if ($majorVersion -ge 20) {
                Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
            } else {
                Write-Host "  [ERRORE] Node.js versione $nodeVersion trovata, ma richiesta >= 20" -ForegroundColor Red
                $allOk = $false
            }
        } else {
            Write-Host "  [ERRORE] Node.js non trovato" -ForegroundColor Red
            $allOk = $false
        }
    } catch {
        Write-Host "  [ERRORE] Node.js non trovato nel PATH" -ForegroundColor Red
        $allOk = $false
    }
    
    # Verifica npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Host "  [OK] npm $npmVersion" -ForegroundColor Green
        } else {
            Write-Host "  [ERRORE] npm non trovato" -ForegroundColor Red
            $allOk = $false
        }
    } catch {
        Write-Host "  [ERRORE] npm non trovato nel PATH" -ForegroundColor Red
        $allOk = $false
    }
    
    # Verifica Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Host "  [OK] Docker trovato: $dockerVersion" -ForegroundColor Green
        } else {
            Write-Host "  [ERRORE] Docker non trovato" -ForegroundColor Red
            $allOk = $false
        }
    } catch {
        Write-Host "  [ERRORE] Docker non trovato nel PATH" -ForegroundColor Red
        Write-Host "           Assicurati che Docker Desktop sia installato e avviato" -ForegroundColor Yellow
        $allOk = $false
    }
    
    return $allOk
}

# Verifica prerequisiti se non saltati
if (-not $SkipPrerequisites) {
    $prereqsOk = Test-Prerequisites
    if (-not $prereqsOk) {
        Write-Host ""
        Write-Host "ERRORE: Prerequisiti mancanti!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Installa i seguenti prerequisiti:" -ForegroundColor Yellow
        Write-Host "  - Node.js >= 20: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "  - Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Oppure esegui: .\setup-local.ps1 -SkipPrerequisites" -ForegroundColor Yellow
        Write-Host "per saltare la verifica (non consigliato)" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Configurazione ambiente..." -ForegroundColor Yellow

# 1. Crea file .env se mancante
$envPath = "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "  Creazione file .env..." -ForegroundColor Cyan
    $envContent = @"
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=rapranger_app
DB_PASSWORD=dev_password_change_in_production
DB_NAME=rapranger
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_REFRESH_SECRET=dev_jwt_refresh_secret_change_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
FRONTEND_URL=http://localhost:5173
"@
    $envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
    Write-Host "  [OK] File .env creato" -ForegroundColor Green
} else {
    Write-Host "  [OK] File .env già esistente" -ForegroundColor Green
}

# 2. Installa dipendenze backend
Write-Host ""
Write-Host "Installazione dipendenze backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "  Esecuzione npm install..." -ForegroundColor Cyan
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERRORE] Installazione dipendenze backend fallita" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        Write-Host "  [OK] Dipendenze backend installate" -ForegroundColor Green
    } catch {
        Write-Host "  [ERRORE] npm non disponibile. Installa Node.js >= 20" -ForegroundColor Red
        Write-Host "           https://nodejs.org/" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "  [OK] Dipendenze backend già installate" -ForegroundColor Green
}
Set-Location ..

# 3. Installa dipendenze frontend
Write-Host ""
Write-Host "Installazione dipendenze frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "  Esecuzione npm install..." -ForegroundColor Cyan
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERRORE] Installazione dipendenze frontend fallita" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        Write-Host "  [OK] Dipendenze frontend installate" -ForegroundColor Green
    } catch {
        Write-Host "  [ERRORE] npm non disponibile. Installa Node.js >= 20" -ForegroundColor Red
        Write-Host "           https://nodejs.org/" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "  [OK] Dipendenze frontend già installate" -ForegroundColor Green
}
Set-Location ..

# 4. Avvia database PostgreSQL
Write-Host ""
Write-Host "Avvio database PostgreSQL..." -ForegroundColor Yellow
Write-Host "  Esecuzione docker-compose up -d postgres..." -ForegroundColor Cyan
try {
    docker-compose up -d postgres
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRORE] Avvio database fallito" -ForegroundColor Red
        Write-Host "           Verifica che Docker Desktop sia installato e avviato" -ForegroundColor Yellow
        Write-Host "           https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  [ERRORE] Docker non disponibile. Installa Docker Desktop" -ForegroundColor Red
    Write-Host "           https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Attendi che il database sia pronto
Write-Host "  Attesa database pronto..." -ForegroundColor Cyan
$maxRetries = 30
$retryCount = 0
$dbReady = $false

while ($retryCount -lt $maxRetries -and -not $dbReady) {
    Start-Sleep -Seconds 2
    $containerStatus = docker ps --filter "name=rapranger-db" --format "{{.Status}}" 2>$null
    if ($containerStatus -like "*healthy*" -or $containerStatus -like "*Up*") {
        $dbReady = $true
    }
    $retryCount++
}

if ($dbReady) {
    Write-Host "  [OK] Database avviato e pronto" -ForegroundColor Green
} else {
    Write-Host "  [AVVISO] Database potrebbe non essere ancora pronto" -ForegroundColor Yellow
    Write-Host "           Attendi qualche secondo prima di eseguire le migrazioni" -ForegroundColor Yellow
}

# 5. Esegui migrazioni database
Write-Host ""
Write-Host "Esecuzione migrazioni database..." -ForegroundColor Yellow
Set-Location backend
Write-Host "  Esecuzione npm run migration:run..." -ForegroundColor Cyan
try {
    npm run migration:run
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRORE] Esecuzione migrazioni fallita" -ForegroundColor Red
        Write-Host "           Verifica che il database sia avviato e pronto" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
    Write-Host "  [OK] Migrazioni eseguite con successo" -ForegroundColor Green
} catch {
    Write-Host "  [ERRORE] npm non disponibile. Installa Node.js >= 20" -ForegroundColor Red
    Write-Host "           https://nodejs.org/" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup completato con successo!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prossimi passi:" -ForegroundColor Yellow
Write-Host "  1. Avvia il backend: cd backend; npm run start:dev" -ForegroundColor Cyan
Write-Host "  2. Avvia il frontend: cd frontend; npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL:" -ForegroundColor Yellow
Write-Host "  - Backend API: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - Health Check: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host ""

