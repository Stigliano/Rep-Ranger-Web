$ErrorActionPreference = "Stop"
$scriptPath = $PSScriptRoot
$projectRoot = Resolve-Path "$scriptPath/.."

Write-Host "Arresto ambiente di sviluppo RepRanger..." -ForegroundColor Yellow

# 1. Stop Database
Write-Host "1. Arresto container Database..." -ForegroundColor Cyan
Set-Location $projectRoot
docker-compose stop

Write-Host "Database arrestato." -ForegroundColor Green
Write-Host "NOTA: Chiudi manualmente le finestre del terminale di Backend e Frontend." -ForegroundColor Yellow

