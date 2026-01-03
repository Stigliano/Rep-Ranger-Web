output "vpc_network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.main.name
}

output "vpc_network_id" {
  description = "ID of the VPC network"
  value       = google_compute_network.main.id
}

output "cloud_sql_instance_name" {
  description = "Name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.name
}

output "cloud_sql_connection_name" {
  description = "Connection name for Cloud SQL"
  value       = google_sql_database_instance.main.connection_name
}

output "cloud_sql_private_ip" {
  description = "Private IP address of Cloud SQL instance"
  value       = google_sql_database_instance.main.private_ip_address
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = google_artifact_registry_repository.main.name
}

output "storage_bucket_name" {
  description = "Cloud Storage bucket name for user files"
  value       = google_storage_bucket.user_files.name
}

output "backend_service_account_email" {
  description = "Backend Cloud Run service account email"
  value       = google_service_account.backend.email
}

output "frontend_service_account_email" {
  description = "Frontend Cloud Run service account email"
  value       = google_service_account.frontend.email
}

output "backend_service_url" {
  description = "Backend Cloud Run service URL"
  value       = google_cloud_run_service.backend.status[0].url
}

output "frontend_service_url" {
  description = "Frontend Cloud Run service URL"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "workload_identity_provider" {
  description = "Full resource name of the Workload Identity Provider per GitHub Actions"
  value       = "projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_pool.workload_identity_pool_id}/providers/${google_iam_workload_identity_pool_provider.github_provider.workload_identity_pool_provider_id}"
}

output "github_actions_service_account_email" {
  description = "Email del Service Account utilizzato da GitHub Actions per CI/CD"
  value       = google_service_account.github_actions.email
}

output "project_number" {
  description = "GCP Project Number (necessario per costruire il workload identity provider)"
  value       = data.google_project.project.number
}

