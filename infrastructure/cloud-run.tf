# Cloud Run Service per Backend
resource "google_cloud_run_service" "backend" {
  name     = "rapranger-backend-${var.environment}"
  location = var.region

  template {
    spec {
      service_account_name  = google_service_account.backend.email
      container_concurrency = 80
      timeout_seconds       = 600

      containers {
        # image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}/backend:latest"
        image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder per primo deploy

        # NOTA: Rimuoviamo la porta esplicita per lasciare che Cloud Run inietti la PORT
        # ports {
        #   container_port = 3000
        # }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        # PORT is reserved and automatically set by Cloud Run
        # env {
        #   name  = "PORT"
        #   value = "3000"
        # }

        env {
          name  = "DB_HOST"
          value = "/cloudsql/${google_sql_database_instance.main.connection_name}"
        }

        env {
          name  = "DB_NAME"
          value = google_sql_database.main.name
        }

        env {
          name  = "DB_USER"
          value = google_sql_user.app_user.name
        }

        env {
          name = "DB_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_password.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "JWT_REFRESH_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_refresh_secret.secret_id
              key  = "latest"
            }
          }
        }

        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
          requests = {
            cpu    = "1"
            memory = "1Gi"
          }
        }
        # Aggiungiamo probe TCP esplicito (opzionale, ma aiuta il debug)
        startup_probe {
          tcp_socket {
            port = 3000 # La nostra app ascolta qui
          }
          initial_delay_seconds = 10
          timeout_seconds       = 5
          period_seconds        = 5
          failure_threshold     = 10
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"        = "1"
        "autoscaling.knative.dev/maxScale"        = "10"
        "run.googleapis.com/cloudsql-instances"   = google_sql_database_instance.main.connection_name
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.main.name
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_vpc_access_connector.main,
    google_project_service.cloud_run
  ]

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image
    ]
  }
}

# Cloud Run Service per Frontend
resource "google_cloud_run_service" "frontend" {
  name     = "rapranger-frontend-${var.environment}"
  location = var.region

  template {
    spec {
      service_account_name  = google_service_account.frontend.email
      container_concurrency = 80
      timeout_seconds       = 60

      containers {
        # image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}/frontend:latest"
        image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder per primo deploy

        ports {
          container_port = 80
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "VITE_API_BASE_URL"
          value = google_cloud_run_service.backend.status[0].url
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
          requests = {
            cpu    = "0.5"
            memory = "256Mi"
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.cloud_run
  ]

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image
    ]
  }
}

# IAM: Permettere accesso pubblico al backend (o configurare autenticazione)
resource "google_cloud_run_service_iam_member" "backend_public" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers" # Modificare per restringere accesso se necessario
}

# IAM: Permettere accesso pubblico al frontend
resource "google_cloud_run_service_iam_member" "frontend_public" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# VPC Access Connector per Cloud Run (per connettersi a Cloud SQL via Private IP)
resource "google_vpc_access_connector" "main" {
  name          = "rapranger-conn-${var.environment}"
  region        = var.region
  network       = google_compute_network.main.name
  ip_cidr_range = "10.8.0.0/28"

  min_instances = 2
  max_instances = 3
  machine_type  = "e2-micro"
}
