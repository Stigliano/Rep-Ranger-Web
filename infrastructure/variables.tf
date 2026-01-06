variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "repranger"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "europe-west1-b"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # Modificare per produzione
}

variable "db_disk_size" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 20
}

variable "db_disk_type" {
  description = "Cloud SQL disk type"
  type        = string
  default     = "PD_SSD"
}

variable "db_backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "db_backup_start_time" {
  description = "Backup start time (HH:MM format in UTC)"
  type        = string
  default     = "03:00"
}

variable "db_availability_type" {
  description = "Availability type (ZONAL or REGIONAL)"
  type        = string
  default     = "ZONAL" # REGIONAL per alta disponibilità
}

variable "github_repository" {
  description = "GitHub repository in formato owner/repo per Workload Identity Federation"
  type        = string
  default     = "Stigliano/Rep-Ranger-Web"
}

