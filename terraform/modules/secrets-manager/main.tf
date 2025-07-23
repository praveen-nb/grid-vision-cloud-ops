# Database credentials secret
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}-${var.environment}-db-credentials"
  description             = "Database credentials for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-db-credentials"
  }
}

# Database credentials secret version
resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = var.db_host
    port     = var.db_port
    dbname   = var.db_name
  })
}

# API keys secret
resource "aws_secretsmanager_secret" "api_keys" {
  name                    = "${var.project_name}-${var.environment}-api-keys"
  description             = "API keys for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-api-keys"
  }
}

# API keys secret version
resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    api_gateway_key = var.api_gateway_key
    external_api_key = var.external_api_key
    jwt_secret = var.jwt_secret
  })
}

# IoT certificates secret
resource "aws_secretsmanager_secret" "iot_certificates" {
  name                    = "${var.project_name}-${var.environment}-iot-certificates"
  description             = "IoT device certificates for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-iot-certificates"
  }
}

# IoT certificates secret version
resource "aws_secretsmanager_secret_version" "iot_certificates" {
  secret_id = aws_secretsmanager_secret.iot_certificates.id
  secret_string = jsonencode({
    root_ca_certificate = var.iot_root_ca_cert
    device_certificate = var.iot_device_cert
    device_private_key = var.iot_device_private_key
  })
}

# Application configuration secret
resource "aws_secretsmanager_secret" "app_config" {
  name                    = "${var.project_name}-${var.environment}-app-config"
  description             = "Application configuration for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-app-config"
  }
}

# Application configuration secret version
resource "aws_secretsmanager_secret_version" "app_config" {
  secret_id = aws_secretsmanager_secret.app_config.id
  secret_string = jsonencode({
    environment = var.environment
    project_name = var.project_name
    region = var.aws_region
    encryption_key = var.encryption_key
    admin_email = var.admin_email
  })
}

# IAM policy for Lambda to access secrets
resource "aws_iam_policy" "secrets_access" {
  name        = "${var.project_name}-${var.environment}-secrets-access"
  description = "Policy for accessing secrets manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.api_keys.arn,
          aws_secretsmanager_secret.iot_certificates.arn,
          aws_secretsmanager_secret.app_config.arn
        ]
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-secrets-access"
  }
}

# KMS key for secrets encryption
resource "aws_kms_key" "secrets" {
  description             = "KMS key for secrets encryption"
  deletion_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-secrets-kms"
  }
}

# KMS key alias
resource "aws_kms_alias" "secrets" {
  name          = "alias/${var.project_name}-${var.environment}-secrets"
  target_key_id = aws_kms_key.secrets.key_id
}

# CloudWatch Log Group for Secrets Manager
resource "aws_cloudwatch_log_group" "secrets_manager" {
  name              = "/aws/secretsmanager/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-secrets-logs"
  }
}