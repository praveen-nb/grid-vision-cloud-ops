# Enhanced VPC Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

# Security Zone Subnets
variable "dmz_subnets" {
  description = "List of DMZ (public) subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.0.0/26", "10.0.0.64/26", "10.0.0.128/26"]
}

variable "application_subnets" {
  description = "List of application subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/26", "10.0.1.64/26", "10.0.1.128/26"]
}

variable "data_subnets" {
  description = "List of data subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.2.0/26", "10.0.2.64/26", "10.0.2.128/26"]
}

variable "management_subnets" {
  description = "List of management subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.3.0/26", "10.0.3.64/26"]
}

# Security Zone CIDRs for NACLs
variable "corporate_cidr" {
  description = "Corporate network CIDR for SSH access"
  type        = string
  default     = "203.0.113.0/24"
}

variable "dmz_zone_cidr" {
  description = "DMZ zone CIDR"
  type        = string
  default     = "10.0.0.0/24"
}

variable "app_zone_cidr" {
  description = "Application zone CIDR"
  type        = string
  default     = "10.0.1.0/24"
}

variable "data_zone_cidr" {
  description = "Data zone CIDR"
  type        = string
  default     = "10.0.2.0/24"
}

variable "mgmt_zone_cidr" {
  description = "Management zone CIDR"
  type        = string
  default     = "10.0.3.0/24"
}

# Logging Configuration
variable "log_retention_days" {
  description = "Number of days to retain VPC flow logs"
  type        = number
  default     = 30
}

# Direct Connect Configuration
variable "enable_direct_connect" {
  description = "Enable AWS Direct Connect integration"
  type        = bool
  default     = false
}

variable "direct_connect_gateway_id" {
  description = "Direct Connect Gateway ID for hybrid connectivity"
  type        = string
  default     = ""
}

variable "on_premises_cidrs" {
  description = "List of on-premises CIDR blocks"
  type        = list(string)
  default     = ["10.10.0.0/16", "10.20.0.0/16", "10.30.0.0/16"]
}

# High Availability Configuration
variable "enable_multi_az_nat" {
  description = "Enable NAT Gateway in multiple AZs for high availability"
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "Enable VPC endpoints for AWS services"
  type        = bool
  default     = true
}

# Cost Optimization
variable "enable_nat_instance" {
  description = "Use NAT instances instead of NAT gateways for cost optimization"
  type        = bool
  default     = false
}

variable "nat_instance_type" {
  description = "Instance type for NAT instances"
  type        = string
  default     = "t3.nano"
}