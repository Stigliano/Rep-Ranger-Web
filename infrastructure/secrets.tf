# Secret per password database
resource "google_secret_manager_secret" "db_password" {
  secret_id = "rapranger-db-password-${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "database"
  }
}

# Secret per JWT secret
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "rapranger-jwt-secret-${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "auth"
  }
}

# Secret per JWT refresh secret
resource "google_secret_manager_secret" "jwt_refresh_secret" {
  secret_id = "rapranger-jwt-refresh-secret-${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "auth"
  }
}

# Secret per encryption key (per audit logs)
resource "google_secret_manager_secret" "audit_encryption_key" {
  secret_id = "rapranger-audit-encryption-key-${var.environment}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    service     = "audit"
  }
}

# NOTA: I valori dei secret devono essere impostati manualmente o via script
# Esempio comando:
# echo -n "your-password" | gcloud secrets versions add rapranger-db-password-prod --data-file=-

