# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-lambda-role"
  }
}

# IAM Policy for Lambda functions
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda_role.id

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
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "kinesis:DescribeStream",
          "kinesis:GetShardIterator",
          "kinesis:GetRecords",
          "kinesis:ListStreams"
        ]
        Resource = var.kinesis_stream_arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "arn:aws:s3:::${var.project_name}-${var.environment}-*/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:${var.project_name}-${var.environment}-*"
      },
      {
        Effect = "Allow"
        Action = [
          "iot:Publish",
          "iot:Subscribe"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach basic execution role
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# Health Check Lambda Function
resource "aws_lambda_function" "health_check" {
  filename         = "${path.module}/lambda_functions/health_check.zip"
  function_name    = "${var.project_name}-${var.environment}-health-check"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  source_code_hash = data.archive_file.health_check_zip.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
      PROJECT_NAME = var.project_name
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-health-check"
  }
}

# Data Processing Lambda Function
resource "aws_lambda_function" "data_processor" {
  filename         = "${path.module}/lambda_functions/data_processor.zip"
  function_name    = "${var.project_name}-${var.environment}-data-processor"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "python3.9"
  timeout         = 300
  memory_size     = 512

  source_code_hash = data.archive_file.data_processor_zip.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
      PROJECT_NAME = var.project_name
      KINESIS_STREAM_NAME = var.kinesis_stream_name
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-data-processor"
  }
}

# Kinesis Event Source Mapping
resource "aws_lambda_event_source_mapping" "kinesis_trigger" {
  event_source_arn  = var.kinesis_stream_arn
  function_name     = aws_lambda_function.data_processor.arn
  starting_position = "LATEST"
  batch_size        = 100
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "health_check_logs" {
  name              = "/aws/lambda/${aws_lambda_function.health_check.function_name}"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-${var.environment}-health-check-logs"
  }
}

resource "aws_cloudwatch_log_group" "data_processor_logs" {
  name              = "/aws/lambda/${aws_lambda_function.data_processor.function_name}"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-${var.environment}-data-processor-logs"
  }
}

# Lambda function source code archives
data "archive_file" "health_check_zip" {
  type        = "zip"
  output_path = "${path.module}/lambda_functions/health_check.zip"
  source {
    content = <<EOF
exports.handler = async (event) => {
    console.log('Health check called');
    
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.ENVIRONMENT,
            project: process.env.PROJECT_NAME
        })
    };
    
    return response;
};
EOF
    filename = "index.js"
  }
}

data "archive_file" "data_processor_zip" {
  type        = "zip"
  output_path = "${path.module}/lambda_functions/data_processor.zip"
  source {
    content = <<EOF
import json
import boto3
import os
from datetime import datetime

def handler(event, context):
    print(f"Processing {len(event['Records'])} records")
    
    # Process Kinesis records
    for record in event['Records']:
        # Decode the data
        payload = json.loads(
            boto3.client('kinesis').decode(record['kinesis']['data'])
        )
        
        print(f"Processing record: {payload}")
        
        # Add your data processing logic here
        # Example: store in S3, send to another service, etc.
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Successfully processed {len(event["Records"])} records',
            'timestamp': datetime.now().isoformat()
        })
    }
EOF
    filename = "index.py"
  }
}