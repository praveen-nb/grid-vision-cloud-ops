variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

# Database credentials
variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_host" {
  description = "Database host"
  type        = string
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "gis_platform"
}

# API keys
variable "api_gateway_key" {
  description = "API Gateway key"
  type        = string
  sensitive   = true
}

variable "external_api_key" {
  description = "External API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

# IoT certificates
variable "iot_root_ca_cert" {
  description = "IoT root CA certificate"
  type        = string
  default     = ""
}

variable "iot_device_cert" {
  description = "IoT device certificate"
  type        = string
  default     = ""
}

variable "iot_device_private_key" {
  description = "IoT device private key"
  type        = string
  sensitive   = true
  default     = ""
}

# Application configuration
variable "encryption_key" {
  description = "Application encryption key"
  type        = string
  sensitive   = true
}

variable "admin_email" {
  description = "Administrator email"
  type        = string
}