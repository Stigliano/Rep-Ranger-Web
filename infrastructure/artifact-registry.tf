# Artifact Registry per immagini Docker
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "rapranger-docker-repo"
  description   = "Docker repository for RapRanger images"
  format        = "DOCKER"
}

# IAM binding per Cloud Build (se usato)
resource "google_artifact_registry_repository_iam_member" "cloud_build" {
  repository = google_artifact_registry_repository.main.name
  location   = google_artifact_registry_repository.main.location
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"

  depends_on = [
    google_project_service.cloud_build
  ]
}

data "google_project" "project" {
  project_id = var.project_id
}

