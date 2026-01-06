# Service Account per Backend Cloud Run
resource "google_service_account" "backend" {
  account_id   = "rapranger-backend-${var.environment}"
  display_name = "RapRanger Backend Service Account"
  description  = "Service account for RapRanger backend Cloud Run service"
}

# Service Account per Frontend Cloud Run
resource "google_service_account" "frontend" {
  account_id   = "rapranger-frontend-${var.environment}"
  display_name = "RapRanger Frontend Service Account"
  description  = "Service account for RapRanger frontend Cloud Run service"
}

# IAM binding: Backend può accedere a Cloud SQL
resource "google_project_iam_member" "backend_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# IAM binding: Backend può leggere Secret Manager
resource "google_project_iam_member" "backend_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# IAM binding: Backend può scrivere su Cloud Storage
resource "google_project_iam_member" "backend_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# IAM binding: Backend può scrivere log
resource "google_project_iam_member" "backend_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# IAM binding: Frontend può scrivere log
resource "google_project_iam_member" "frontend_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.frontend.email}"
}

# Service Account per GitHub Actions CI/CD
resource "google_service_account" "github_actions" {
  account_id   = "github-actions-sa"
  display_name = "GitHub Actions CI/CD Service Account"
  description  = "Service account utilizzato da GitHub Actions per deploy e build"
}

# IAM binding: GitHub Actions può deployare su Cloud Run
resource "google_project_iam_member" "github_actions_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# IAM binding: GitHub Actions può scrivere su Artifact Registry
resource "google_project_iam_member" "github_actions_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# IAM binding: GitHub Actions può impersonare Service Accounts
resource "google_project_iam_member" "github_actions_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# IAM binding: GitHub Actions può gestire Storage (per Terraform state e altri usi)
resource "google_project_iam_member" "github_actions_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Workload Identity Binding: GitHub Actions può impersonare il Service Account
resource "google_service_account_iam_member" "github_actions_workload_identity" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_pool.workload_identity_pool_id}/attribute.repository/${var.github_repository}"
}

# Data source per ottenere il project number (necessario per il binding)
# data "google_project" "project" {
#   project_id = var.project_id
# }

