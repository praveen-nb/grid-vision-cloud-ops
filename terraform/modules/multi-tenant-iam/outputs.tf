output "tenant_roles" {
  description = "IAM roles for each tenant"
  value = {
    for tenant_name, role in aws_iam_role.tenant_role : tenant_name => {
      arn  = role.arn
      name = role.name
    }
  }
}

output "tenant_buckets" {
  description = "S3 buckets for each tenant"
  value = {
    for tenant_name, bucket in aws_s3_bucket.tenant_bucket : tenant_name => {
      name = bucket.bucket
      arn  = bucket.arn
    }
  }
}

output "tenant_log_groups" {
  description = "CloudWatch log groups for each tenant"
  value = {
    for tenant_name, log_group in aws_cloudwatch_log_group.tenant_logs : tenant_name => {
      name = log_group.name
      arn  = log_group.arn
    }
  }
}