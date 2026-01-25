$ErrorActionPreference = "Stop"

Write-Host "Starting verification of Body Tracking fixes..." -ForegroundColor Cyan

# 1. Verify Migration File
$migrationPath = "backend\src\database\migrations\1767600000003-CreateBodyTrackingSessionsAndLinkPhotos.ts"
if (Test-Path $migrationPath) {
    Write-Host "[PASS] Migration file exists: $migrationPath" -ForegroundColor Green
    $content = Get-Content $migrationPath -Raw
    if ($content -match "body_tracking_sessions" -and $content -match "createTable") {
        Write-Host "[PASS] Migration creates 'body_tracking_sessions' table." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Migration does not seem to create 'body_tracking_sessions' table." -ForegroundColor Red
    }
    if ($content -match "body_progress_photos" -and $content -match "session_id") {
        Write-Host "[PASS] Migration adds 'session_id' to 'body_progress_photos'." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Migration does not seem to add 'session_id' to 'body_progress_photos'." -ForegroundColor Red
    }
} else {
    Write-Host "[FAIL] Migration file missing: $migrationPath" -ForegroundColor Red
}

# 2. Verify Controller Update
$controllerPath = "backend\src\body-tracking\body-tracking.controller.ts"
if (Test-Path $controllerPath) {
    $content = Get-Content $controllerPath -Raw
    # Look for @Get() without arguments, followed by a method
    if ($content -match "@Get\(\)\s+async\s+getAllMetrics") {
        Write-Host "[PASS] BodyTrackingController has root @Get() endpoint." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] BodyTrackingController missing root @Get() endpoint." -ForegroundColor Red
    }
} else {
    Write-Host "[FAIL] Controller file missing: $controllerPath" -ForegroundColor Red
}

Write-Host "Verification complete." -ForegroundColor Cyan
