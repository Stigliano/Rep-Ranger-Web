$ErrorActionPreference = "Stop"
$scriptPath = $PSScriptRoot
$projectRoot = Resolve-Path "$scriptPath/.."

Write-Host "Avvio ambiente di sviluppo RepRanger..." -ForegroundColor Green

# 1. Avvio Database
Write-Host "1. Avvio container Database..." -ForegroundColor Cyan
Set-Location $projectRoot
docker-compose up -d postgres

# 2. Avvio Backend (Nuova Finestra)
Write-Host "2. Avvio Backend (Nuova Finestra)..." -ForegroundColor Cyan
$backendPath = Join-Path $projectRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run start:dev"

# 3. Avvio Frontend (Nuova Finestra)
Write-Host "3. Avvio Frontend (Nuova Finestra)..." -ForegroundColor Cyan
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host "Tutti i servizi sono in fase di avvio!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"

