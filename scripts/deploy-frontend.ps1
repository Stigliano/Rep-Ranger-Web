$ErrorActionPreference = "Stop"

function Check-Command($cmd) {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error executing $cmd" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

$PROJECT_ID = "raprenger-web"
$REGION = "europe-west1"
$REPO_NAME = "rapranger-docker-repo"
$IMAGE_NAME = "frontend"
$SERVICE_NAME = "rapranger-frontend-prod"
$TAG = "latest"

$FULL_IMAGE_PATH = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME`:$TAG"

Write-Host "Starting Frontend Deployment..." -ForegroundColor Cyan

# Check if Docker is running
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# 1. Configure Docker Auth
Write-Host "Configuring Docker Authentication..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
Check-Command "gcloud auth"

# 2. Build Docker Image
Write-Host "Building Docker Image: $FULL_IMAGE_PATH"
docker build -t $FULL_IMAGE_PATH ./frontend
Check-Command "docker build"

# 3. Push Docker Image
Write-Host "Pushing Docker Image..."
docker push $FULL_IMAGE_PATH
Check-Command "docker push"

# 4. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
    --image $FULL_IMAGE_PATH `
    --region $REGION `
    --project $PROJECT_ID `
    --quiet
Check-Command "gcloud run deploy"

Write-Host "Deployment Complete!" -ForegroundColor Green
