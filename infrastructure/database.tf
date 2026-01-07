# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "main" {
  name             = "rapranger-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier                        = var.db_tier
    availability_type           = var.db_availability_type
    deletion_protection_enabled = var.environment == "prod" ? true : false

    disk_type       = var.db_disk_type
    disk_size       = var.db_disk_size
    disk_autoresize = true

    ip_configuration {
      ipv4_enabled                                  = false # Solo Private IP
      private_network                               = google_compute_network.main.id
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = var.db_backup_enabled
      start_time                     = var.db_backup_start_time
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    maintenance_window {
      day          = 7 # Domenica
      hour         = 4 # 04:00 UTC
      update_track = "stable"
    }
  }

  deletion_protection = var.environment == "prod" ? true : false

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}

# Database principale
resource "google_sql_database" "main" {
  name     = "rapranger"
  instance = google_sql_database_instance.main.name
}

# Utente applicazione (password gestita via Secret Manager)
resource "google_sql_user" "app_user" {
  name     = "rapranger_app"
  instance = google_sql_database_instance.main.name
  type     = "BUILT_IN"
  password = "CHANGE_ME_VIA_SECRET_MANAGER" # Sostituire con secret manager
}

# Private Service Connection per Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "rapranger-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

