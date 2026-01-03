# VPC Network
resource "google_compute_network" "main" {
  name                    = "rapranger-vpc-${var.environment}"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"

  description = "VPC network for RapRanger ${var.environment} environment"
}

# Subnet per Cloud Run e Cloud SQL (private)
resource "google_compute_subnetwork" "private" {
  name          = "rapranger-private-subnet-${var.environment}"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.main.id

  private_ip_google_access = true

  description = "Private subnet for Cloud Run and Cloud SQL"
}

# Subnet per NAT Gateway (public)
resource "google_compute_subnetwork" "public" {
  name          = "rapranger-public-subnet-${var.environment}"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.main.id

  description = "Public subnet for NAT Gateway"
}

# Cloud Router per NAT
resource "google_compute_router" "main" {
  name    = "rapranger-router-${var.environment}"
  region  = var.region
  network = google_compute_network.main.id

  bgp {
    asn = 64514
  }
}

# Cloud NAT per connettività in uscita sicura
resource "google_compute_router_nat" "main" {
  name   = "rapranger-nat-${var.environment}"
  router = google_compute_router.main.name
  region = var.region

  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall rule per permettere traffico interno
resource "google_compute_firewall" "internal" {
  name    = "rapranger-internal-${var.environment}"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/8"]
  target_tags  = ["internal"]

  description = "Allow internal traffic within VPC"
}

# Firewall rule per Cloud SQL (solo da Cloud Run)
resource "google_compute_firewall" "cloud_sql" {
  name    = "rapranger-cloud-sql-${var.environment}"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_ranges = ["10.0.1.0/24"] # Solo dalla subnet privata
  target_tags   = ["cloud-sql"]

  description = "Allow PostgreSQL traffic from Cloud Run to Cloud SQL"
}

