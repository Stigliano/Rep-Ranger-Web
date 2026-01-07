# Cloud Storage Bucket per file utenti
resource "google_storage_bucket" "user_files" {
  name          = "rapranger-user-files-${var.environment}"
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 2555 # 7 anni
    }
    action {
      type = "Delete"
    }
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    response_header = ["Content-Type", "Access-Control-Allow-Origin"]
    max_age_seconds = 3600
  }
}

# KMS Key per encryption storage
resource "google_kms_key_ring" "storage_key_ring" {
  name     = "rapranger-storage-keys-${var.environment}"
  location = var.region
}

resource "google_kms_crypto_key" "storage_key" {
  name            = "storage-encryption-key"
  key_ring        = google_kms_key_ring.storage_key_ring.id
  rotation_period = "7776000s" # 90 giorni

  lifecycle {
    prevent_destroy = true
  }
}

# IAM binding per Cloud Run backend (accesso storage)
resource "google_storage_bucket_iam_member" "backend_storage_access" {
  bucket = google_storage_bucket.user_files.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.backend.email}"
}

# Data source per ottenere il Service Account di Cloud Storage
data "google_storage_project_service_account" "gcs_account" {
}

# IAM binding: Permettere al Service Agent di Storage di usare la chiave KMS
resource "google_kms_crypto_key_iam_member" "gcs_key_user" {
  crypto_key_id = google_kms_crypto_key.storage_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_account.email_address}"
}
