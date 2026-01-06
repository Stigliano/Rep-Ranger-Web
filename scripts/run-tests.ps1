<#
.SYNOPSIS
    Script per eseguire i test del progetto RepRanger con percorsi assoluti.
    
.DESCRIPTION
    Questo script gestisce l'esecuzione di unit test, e2e test e test manuali
    per Backend e Frontend, navigando automaticamente nelle directory corrette.
    
.PARAMETER TestType
    Il tipo di test da eseguire. Opzioni:
    - BackendUnit: Esegue i unit test del backend
    - BackendE2E: Esegue gli E2E test del backend
    - FrontendUnit: Esegue i test del frontend
    - ManualAuth: Esegue il test manuale del flusso Auth (Richiede server backend attivo)
    - ManualProgram: Esegue il test manuale Creazione Programma (Richiede server backend attivo)
    - All: Esegue tutti i test automatici (Backend Unit+E2E, Frontend)

.EXAMPLE
    .\run-tests.ps1 -TestType BackendUnit
#>

param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("BackendUnit", "BackendE2E", "FrontendUnit", "ManualAuth", "ManualProgram", "All")]
    [string]$TestType
)

# Definizione Percorsi Assoluti
$BackendPath = "C:\Users\d.stigliano\TrainLog\RepRanger web\backend"
$FrontendPath = "C:\Users\d.stigliano\TrainLog\RepRanger web\frontend"

# Funzione helper per eseguire comandi in una directory specifica
function Run-TestCommand {
    param (
        [string]$Path,
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "AVVIO: $Description" -ForegroundColor Yellow
    Write-Host "PATH: $Path" -ForegroundColor DarkGray
    Write-Host "CMD: $Command" -ForegroundColor DarkGray
    Write-Host "========================================================`n" -ForegroundColor Cyan

    Push-Location -Path $Path
    try {
        # Esegue il comando. Invoke-Expression permette di eseguire stringhe come comandi
        # Nota: per comandi complessi npm meglio chiamare direttamente powershell /c o cmd /c se necessario,
        # ma qui chiamiamo direttamernte npm/npx che sono nel path.
        Invoke-Expression $Command
    }
    catch {
        Write-Error "Errore durante l'esecuzione di: $Description"
        Write-Error $_
    }
    finally {
        Pop-Location
    }
}

# Se nessun parametro è passato, mostra menu interattivo
if (-not $TestType) {
    Write-Host "Seleziona il test da eseguire:" -ForegroundColor Green
    Write-Host "1. Backend Unit Tests"
    Write-Host "2. Backend E2E Tests"
    Write-Host "3. Frontend Unit Tests"
    Write-Host "4. Manual Test: Auth Flow (Richiede Server)"
    Write-Host "5. Manual Test: Create Program (Richiede Server)"
    Write-Host "6. Esegui TUTTI i test automatici"
    
    $selection = Read-Host "Inserisci numero (1-6)"
    
    switch ($selection) {
        "1" { $TestType = "BackendUnit" }
        "2" { $TestType = "BackendE2E" }
        "3" { $TestType = "FrontendUnit" }
        "4" { $TestType = "ManualAuth" }
        "5" { $TestType = "ManualProgram" }
        "6" { $TestType = "All" }
        Default { Write-Warning "Selezione non valida."; exit }
    }
}

# Esecuzione in base al tipo selezionato
switch ($TestType) {
    "BackendUnit" {
        Run-TestCommand -Path $BackendPath -Command "npm run test" -Description "Backend Unit Tests"
    }
    
    "BackendE2E" {
        Run-TestCommand -Path $BackendPath -Command "npm run test:e2e" -Description "Backend E2E Tests"
    }
    
    "FrontendUnit" {
        Run-TestCommand -Path $FrontendPath -Command "npm run test" -Description "Frontend Unit Tests"
    }
    
    "ManualAuth" {
        Write-Warning "Assicurati che il server backend sia attivo su http://localhost:3000"
        # Usiamo npx ts-node per eseguire il file TS senza compilarlo
        Run-TestCommand -Path $BackendPath -Command "npx ts-node test/manual/auth-profile-flow.ts" -Description "Manual Auth Test"
    }
    
    "ManualProgram" {
        Write-Warning "Assicurati che il server backend sia attivo su http://localhost:3000"
        Run-TestCommand -Path $BackendPath -Command "npx ts-node test/manual/create-program-test.ts" -Description "Manual Create Program Test"
    }
    
    "All" {
        Run-TestCommand -Path $BackendPath -Command "npm run test" -Description "Backend Unit Tests"
        Run-TestCommand -Path $BackendPath -Command "npm run test:e2e" -Description "Backend E2E Tests"
        Run-TestCommand -Path $FrontendPath -Command "npm run test" -Description "Frontend Unit Tests"
    }
}

Write-Host "`nTest Completati." -ForegroundColor Green



