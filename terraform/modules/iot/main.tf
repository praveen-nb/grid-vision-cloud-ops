# IoT Core Thing Type for Smart Meters
resource "aws_iot_thing_type" "smart_meter" {
  name = "${var.project_name}-${var.environment}-smart-meter"

  properties {
    description = "Smart meter devices for ${var.project_name}"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-smart-meter-type"
  }
}

# IoT Core Policy for Smart Meters
resource "aws_iot_policy" "smart_meter_policy" {
  name = "${var.project_name}-${var.environment}-smart-meter-policy"

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
          "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:topic/${var.project_name}/${var.environment}/smartmeter/*",
          "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:topicfilter/${var.project_name}/${var.environment}/smartmeter/*",
          "arn:aws:iot:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:client/${var.project_name}-${var.environment}-*"
        ]
      }
    ]
  })
}

# IoT Rule to forward data to Kinesis
resource "aws_iot_topic_rule" "smart_meter_data" {
  name        = "${replace(var.project_name, "-", "_")}_${var.environment}_smart_meter_data"
  description = "Forward smart meter data to Kinesis"
  enabled     = true
  sql         = "SELECT *, timestamp() as timestamp FROM 'topic/${var.project_name}/${var.environment}/smartmeter/+'"
  sql_version = "2016-03-23"

  kinesis {
    stream_name   = split(":", var.kinesis_stream_arn)[5]
    partition_key = "$${deviceId}"
    role_arn      = aws_iam_role.iot_kinesis_role.arn
  }

  cloudwatch_logs {
    log_group_name = aws_cloudwatch_log_group.iot_logs.name
    role_arn       = aws_iam_role.iot_logs_role.arn
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-smart-meter-rule"
  }
}

# CloudWatch Log Group for IoT
resource "aws_cloudwatch_log_group" "iot_logs" {
  name              = "/aws/iot/${var.project_name}-${var.environment}"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-${var.environment}-iot-logs"
  }
}

# IAM Role for IoT to Kinesis
resource "aws_iam_role" "iot_kinesis_role" {
  name = "${var.project_name}-${var.environment}-iot-kinesis-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "iot.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-iot-kinesis-role"
  }
}

# IAM Policy for IoT to Kinesis
resource "aws_iam_role_policy" "iot_kinesis_policy" {
  name = "${var.project_name}-${var.environment}-iot-kinesis-policy"
  role = aws_iam_role.iot_kinesis_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kinesis:PutRecord",
          "kinesis:PutRecords"
        ]
        Resource = var.kinesis_stream_arn
      }
    ]
  })
}

# IAM Role for IoT to CloudWatch Logs
resource "aws_iam_role" "iot_logs_role" {
  name = "${var.project_name}-${var.environment}-iot-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "iot.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-iot-logs-role"
  }
}

# IAM Policy for IoT to CloudWatch Logs
resource "aws_iam_role_policy" "iot_logs_policy" {
  name = "${var.project_name}-${var.environment}-iot-logs-policy"
  role = aws_iam_role.iot_logs_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.iot_logs.arn}:*"
      }
    ]
  })
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}