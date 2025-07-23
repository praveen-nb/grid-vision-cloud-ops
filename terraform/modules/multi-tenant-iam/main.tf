# Multi-tenant IAM roles and policies
locals {
  tenant_names = [for tenant in var.tenants : tenant.name]
}

# IAM Role for each tenant
resource "aws_iam_role" "tenant_role" {
  for_each = { for tenant in var.tenants : tenant.name => tenant }

  name = "${var.project_name}-${var.environment}-${each.value.name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "ec2.amazonaws.com",
            "lambda.amazonaws.com"
          ]
        }
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = data.aws_region.current.name
          }
        }
      }
    ]
  })

  tags = {
    Name   = "${var.project_name}-${var.environment}-${each.value.name}-role"
    Tenant = each.value.name
  }
}

# S3 Bucket for each tenant
resource "aws_s3_bucket" "tenant_bucket" {
  for_each = { for tenant in var.tenants : tenant.name => tenant }

  bucket = "${var.project_name}-${var.environment}-${each.value.name}-data"

  tags = {
    Name   = "${var.project_name}-${var.environment}-${each.value.name}-data"
    Tenant = each.value.name
  }
}

resource "aws_s3_bucket_versioning" "tenant_bucket" {
  for_each = aws_s3_bucket.tenant_bucket

  bucket = each.value.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tenant_bucket" {
  for_each = aws_s3_bucket.tenant_bucket

  bucket = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Tenant-specific S3 policy
resource "aws_iam_policy" "tenant_s3_policy" {
  for_each = { for tenant in var.tenants : tenant.name => tenant }

  name        = "${var.project_name}-${var.environment}-${each.value.name}-s3-policy"
  description = "S3 access policy for tenant ${each.value.name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.tenant_bucket[each.key].arn,
          "${aws_s3_bucket.tenant_bucket[each.key].arn}/*"
        ]
      }
    ]
  })

  tags = {
    Name   = "${var.project_name}-${var.environment}-${each.value.name}-s3-policy"
    Tenant = each.value.name
  }
}

# Tenant-specific IoT policy
resource "aws_iam_policy" "tenant_iot_policy" {
  for_each = { for tenant in var.tenants : tenant.name => tenant }

  name        = "${var.project_name}-${var.environment}-${each.value.name}-iot-policy"
  description = "IoT access policy for tenant ${each.value.name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iot:Publish",
          "iot:Subscribe",
          "iot:Connect",
          "iot:Receive"
        ]
        Resource = [
          "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:topic/${var.project_name}/${var.environment}/${each.value.name}/*",
          "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:topicfilter/${var.project_name}/${var.environment}/${each.value.name}/*",
          "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:client/${var.project_name}-${var.environment}-${each.value.name}-*"
        ]
      }
    ]
  })

  tags = {
    Name   = "${var.project_name}-${var.environment}-${each.value.name}-iot-policy"
    Tenant = each.value.name
  }
}

# Attach S3 policy to tenant role
resource "aws_iam_role_policy_attachment" "tenant_s3_policy_attachment" {
  for_each = aws_iam_policy.tenant_s3_policy

  role       = aws_iam_role.tenant_role[each.key].name
  policy_arn = each.value.arn
}

# Attach IoT policy to tenant role
resource "aws_iam_role_policy_attachment" "tenant_iot_policy_attachment" {
  for_each = aws_iam_policy.tenant_iot_policy

  role       = aws_iam_role.tenant_role[each.key].name
  policy_arn = each.value.arn
}

# CloudWatch Log Group for each tenant
resource "aws_cloudwatch_log_group" "tenant_logs" {
  for_each = { for tenant in var.tenants : tenant.name => tenant }

  name              = "/aws/${var.project_name}/${var.environment}/${each.value.name}"
  retention_in_days = 14

  tags = {
    Name   = "${var.project_name}-${var.environment}-${each.value.name}-logs"
    Tenant = each.value.name
  }
}

# Tenant-specific CloudWatch policy
resource "aws_iam_policy" "tenant_cloudwatch_policy" {
  for_each = { for tenant in var.tenants : tenant.name => tenant }

  name        = "${var.project_name}-${var.environment}-${each.value.name}-cloudwatch-policy"
  description = "CloudWatch access policy for tenant ${each.value.name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "${aws_cloudwatch_log_group.tenant_logs[each.key].arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "${var.project_name}/${var.environment}/${each.value.name}"
          }
        }
      }
    ]
  })

  tags = {
    Name   = "${var.project_name}-${var.environment}-${each.value.name}-cloudwatch-policy"
    Tenant = each.value.name
  }
}

# Attach CloudWatch policy to tenant role
resource "aws_iam_role_policy_attachment" "tenant_cloudwatch_policy_attachment" {
  for_each = aws_iam_policy.tenant_cloudwatch_policy

  role       = aws_iam_role.tenant_role[each.key].name
  policy_arn = each.value.arn
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}