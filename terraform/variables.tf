# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "aws-gis-infrastructure"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Networking Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
}

# Compute Configuration
variable "ec2_instance_type" {
  description = "EC2 instance type for processing servers"
  type        = string
  default     = "t3.large"
}

variable "key_pair_name" {
  description = "Name of the EC2 Key Pair"
  type        = string
  default     = ""
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS instance in GB"
  type        = number
  default     = 20
}

# Multi-tenant Configuration
variable "tenants" {
  description = "List of tenant configurations"
  type = list(object({
    name        = string
    environment = string
    resources = object({
      ec2_instances = number
      storage_gb    = number
      iot_devices   = number
    })
  }))
  default = [
    {
      name        = "tenant-demo"
      environment = "dev"
      resources = {
        ec2_instances = 1
        storage_gb    = 100
        iot_devices   = 50
      }
    }
  ]
}

# IoT Configuration
variable "iot_device_certificate_arn" {
  description = "ARN of the IoT device certificate"
  type        = string
  default     = ""
}

# SageMaker Configuration
variable "sagemaker_instance_type" {
  description = "SageMaker endpoint instance type"
  type        = string
  default     = "ml.t2.medium"
}

# Monitoring Configuration
variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "alert_email" {
  description = "Email for CloudWatch alerts"
  type        = string
  default     = ""
}

# Security Configuration
variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to access resources"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Restrict this in production
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

# Cost Optimization
variable "enable_cost_optimization" {
  description = "Enable cost optimization features"
  type        = bool
  default     = true
}

variable "auto_scaling_enabled" {
  description = "Enable auto scaling for EC2 instances"
  type        = bool
  default     = true
}