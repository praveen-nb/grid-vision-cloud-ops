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

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"
  
  project_name        = var.project_name
  environment         = var.environment
  kinesis_stream_arn  = module.streaming.kinesis_stream_arn
  kinesis_stream_name = module.streaming.kinesis_stream_name
}

# API Gateway
module "api_gateway" {
  source = "./modules/api-gateway"
  
  project_name                      = var.project_name
  environment                       = var.environment
  health_check_lambda_invoke_arn    = module.lambda.health_check_invoke_arn
  health_check_lambda_function_name = module.lambda.health_check_function_name
}

# Secrets Manager
module "secrets_manager" {
  source = "./modules/secrets-manager"
  
  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  db_password        = var.db_password
  db_host            = module.database.endpoint
  db_port            = module.database.port
  api_gateway_key    = module.api_gateway.api_key_value
  jwt_secret         = var.jwt_secret
  encryption_key     = var.encryption_key
  admin_email        = var.alert_email
  external_api_key   = var.external_api_key
}

# CloudFront CDN
module "cloudfront" {
  source = "./modules/cloudfront"
  
  project_name             = var.project_name
  environment              = var.environment
  api_gateway_invoke_url   = module.api_gateway.api_gateway_invoke_url
  api_gateway_stage_name   = module.api_gateway.api_gateway_stage_name
  enable_waf              = var.enable_waf
}

# Route53 DNS
module "route53" {
  source = "./modules/route53"
  
  project_name           = var.project_name
  environment            = var.environment
  aws_region             = var.aws_region
  domain_name            = var.domain_name
  create_hosted_zone     = var.create_hosted_zone
  cloudfront_domain_name = module.cloudfront.cloudfront_domain_name
  enable_health_checks   = var.enable_health_checks
  sns_topic_arn          = module.monitoring.sns_topic_arn
}