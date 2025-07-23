terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
}

# Security
module "security" {
  source = "./modules/security"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = var.vpc_cidr
}

# IoT Core and Device Management
module "iot" {
  source = "./modules/iot"
  
  project_name = var.project_name
  environment  = var.environment
  
  kinesis_stream_arn = module.streaming.kinesis_stream_arn
}

# Data Streaming and Processing
module "streaming" {
  source = "./modules/streaming"
  
  project_name = var.project_name
  environment  = var.environment
}

# Compute Resources
module "compute" {
  source = "./modules/compute"
  
  project_name = var.project_name
  environment  = var.environment
  
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  public_subnet_ids   = module.vpc.public_subnet_ids
  security_group_id   = module.security.ec2_security_group_id
  
  instance_type = var.ec2_instance_type
  key_pair_name = var.key_pair_name
}

# Database
module "database" {
  source = "./modules/database"
  
  project_name = var.project_name
  environment  = var.environment
  
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security.rds_security_group_id
  
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
}

# Storage
module "storage" {
  source = "./modules/storage"
  
  project_name = var.project_name
  environment  = var.environment
}

# Machine Learning
module "ml" {
  source = "./modules/ml"
  
  project_name = var.project_name
  environment  = var.environment
  
  vpc_id            = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id = module.security.sagemaker_security_group_id
}

# Monitoring and Logging
module "monitoring" {
  source = "./modules/monitoring"
  
  project_name = var.project_name
  environment  = var.environment
  
  vpc_id = module.vpc.vpc_id
  
  # Resource ARNs for monitoring
  ec2_instance_ids    = module.compute.instance_ids
  rds_instance_id     = module.database.instance_id
  kinesis_stream_name = module.streaming.kinesis_stream_name
}

# Multi-tenant IAM roles and policies
module "multi_tenant_iam" {
  source = "./modules/multi-tenant-iam"
  
  project_name = var.project_name
  environment  = var.environment
  tenants      = var.tenants
}