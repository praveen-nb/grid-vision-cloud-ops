# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

# Compute Outputs
output "ec2_instance_ids" {
  description = "IDs of the EC2 instances"
  value       = module.compute.instance_ids
}

output "ec2_public_ips" {
  description = "Public IP addresses of EC2 instances"
  value       = module.compute.public_ips
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = module.compute.load_balancer_dns
}

# Database Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS instance port"
  value       = module.database.port
}

# Storage Outputs
output "s3_bucket_names" {
  description = "Names of the S3 buckets"
  value       = module.storage.bucket_names
}

output "s3_bucket_arns" {
  description = "ARNs of the S3 buckets"
  value       = module.storage.bucket_arns
}

# IoT Outputs
output "iot_endpoint" {
  description = "IoT Core endpoint"
  value       = module.iot.iot_endpoint
}

output "iot_policy_arn" {
  description = "ARN of the IoT policy"
  value       = module.iot.iot_policy_arn
}

# Streaming Outputs
output "kinesis_stream_name" {
  description = "Name of the Kinesis stream"
  value       = module.streaming.kinesis_stream_name
}

output "kinesis_stream_arn" {
  description = "ARN of the Kinesis stream"
  value       = module.streaming.kinesis_stream_arn
}

# Machine Learning Outputs
output "sagemaker_endpoint_name" {
  description = "Name of the SageMaker endpoint"
  value       = module.ml.endpoint_name
}

output "sagemaker_model_arn" {
  description = "ARN of the SageMaker model"
  value       = module.ml.model_arn
}

# Security Outputs
output "security_group_ids" {
  description = "IDs of the security groups"
  value = {
    ec2       = module.security.ec2_security_group_id
    rds       = module.security.rds_security_group_id
    sagemaker = module.security.sagemaker_security_group_id
  }
}

# Monitoring Outputs
output "cloudwatch_dashboard_url" {
  description = "URL of the CloudWatch dashboard"
  value       = module.monitoring.dashboard_url
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alerts"
  value       = module.monitoring.sns_topic_arn
}

# Multi-tenant Outputs
output "tenant_iam_roles" {
  description = "IAM roles for each tenant"
  value       = module.multi_tenant_iam.tenant_roles
}

output "tenant_s3_buckets" {
  description = "S3 buckets for each tenant"
  value       = module.multi_tenant_iam.tenant_buckets
}

# Cost Information
output "estimated_monthly_cost" {
  description = "Estimated monthly cost (approximate)"
  value = {
    compute   = "~$150-300/month (depending on usage)"
    storage   = "~$50-100/month (depending on data volume)"
    database  = "~$30-60/month"
    iot       = "~$20-50/month (depending on device count)"
    ml        = "~$100-200/month (depending on inference volume)"
    total     = "~$350-710/month"
  }
}