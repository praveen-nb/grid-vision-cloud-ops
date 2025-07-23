# Kinesis Data Stream
resource "aws_kinesis_stream" "main" {
  name        = "${var.project_name}-${var.environment}-data-stream"
  shard_count = 2

  shard_level_metrics = [
    "IncomingRecords",
    "OutgoingRecords",
  ]

  encryption_type = "KMS"
  kms_key_id      = aws_kms_key.kinesis_key.arn

  tags = {
    Name = "${var.project_name}-${var.environment}-data-stream"
  }
}

# KMS Key for Kinesis encryption
resource "aws_kms_key" "kinesis_key" {
  description             = "KMS key for Kinesis stream encryption"
  deletion_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-kinesis-key"
  }
}

resource "aws_kms_alias" "kinesis_key_alias" {
  name          = "alias/${var.project_name}-${var.environment}-kinesis"
  target_key_id = aws_kms_key.kinesis_key.key_id
}

# Kinesis Data Firehose for archiving to S3
resource "aws_kinesis_firehose_delivery_stream" "main" {
  name        = "${var.project_name}-${var.environment}-delivery-stream"
  destination = "extended_s3"

  kinesis_source_configuration {
    kinesis_stream_arn = aws_kinesis_stream.main.arn
    role_arn           = aws_iam_role.firehose_role.arn
  }

  extended_s3_configuration {
    role_arn           = aws_iam_role.firehose_role.arn
    bucket_arn         = aws_s3_bucket.data_archive.arn
    prefix             = "year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/"
    error_output_prefix = "errors/"

    buffer_size     = 5
    buffer_interval = 300
    compression_format = "GZIP"

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = aws_cloudwatch_log_group.firehose_logs.name
      log_stream_name = "S3Delivery"
    }

    data_format_conversion_configuration {
      output_format_configuration {
        serializer {
          parquet_ser_de {}
        }
      }

      schema_configuration {
        database_name = aws_glue_catalog_database.main.name
        table_name    = aws_glue_catalog_table.main.name
        role_arn      = aws_iam_role.firehose_role.arn
      }
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-delivery-stream"
  }
}

# S3 Bucket for data archiving
resource "aws_s3_bucket" "data_archive" {
  bucket = "${var.project_name}-${var.environment}-data-archive"

  tags = {
    Name = "${var.project_name}-${var.environment}-data-archive"
  }
}

resource "aws_s3_bucket_versioning" "data_archive" {
  bucket = aws_s3_bucket.data_archive.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_archive" {
  bucket = aws_s3_bucket.data_archive.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Glue Catalog Database
resource "aws_glue_catalog_database" "main" {
  name = "${replace(var.project_name, "-", "_")}_${var.environment}"

  tags = {
    Name = "${var.project_name}-${var.environment}-glue-database"
  }
}

# Glue Catalog Table
resource "aws_glue_catalog_table" "main" {
  name          = "smart_meter_data"
  database_name = aws_glue_catalog_database.main.name

  table_type = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL              = "TRUE"
    "projection.enabled"  = "true"
    "projection.year.type" = "integer"
    "projection.year.range" = "2020,2030"
    "projection.month.type" = "integer"
    "projection.month.range" = "1,12"
    "projection.day.type" = "integer"
    "projection.day.range" = "1,31"
    "projection.hour.type" = "integer"
    "projection.hour.range" = "0,23"
    "storage.location.template" = "s3://${aws_s3_bucket.data_archive.bucket}/year=$${year}/month=$${month}/day=$${day}/hour=$${hour}/"
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.data_archive.bucket}/"
    input_format  = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"

    ser_de_info {
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
    }

    columns {
      name = "deviceId"
      type = "string"
    }

    columns {
      name = "timestamp"
      type = "bigint"
    }

    columns {
      name = "voltage"
      type = "double"
    }

    columns {
      name = "current"
      type = "double"
    }

    columns {
      name = "power"
      type = "double"
    }

    columns {
      name = "temperature"
      type = "double"
    }
  }

  partition_keys {
    name = "year"
    type = "string"
  }

  partition_keys {
    name = "month"
    type = "string"
  }

  partition_keys {
    name = "day"
    type = "string"
  }

  partition_keys {
    name = "hour"
    type = "string"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-glue-table"
  }
}

# CloudWatch Log Group for Firehose
resource "aws_cloudwatch_log_group" "firehose_logs" {
  name              = "/aws/kinesisfirehose/${var.project_name}-${var.environment}"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-${var.environment}-firehose-logs"
  }
}

# IAM Role for Firehose
resource "aws_iam_role" "firehose_role" {
  name = "${var.project_name}-${var.environment}-firehose-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "firehose.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-firehose-role"
  }
}

# IAM Policy for Firehose
resource "aws_iam_role_policy" "firehose_policy" {
  name = "${var.project_name}-${var.environment}-firehose-policy"
  role = aws_iam_role.firehose_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:AbortMultipartUpload",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.data_archive.arn,
          "${aws_s3_bucket.data_archive.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kinesis:DescribeStream",
          "kinesis:GetShardIterator",
          "kinesis:GetRecords",
          "kinesis:ListShards"
        ]
        Resource = aws_kinesis_stream.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "glue:GetTable",
          "glue:GetTableVersion",
          "glue:GetTableVersions"
        ]
        Resource = [
          "arn:aws:glue:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:catalog",
          "arn:aws:glue:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:database/${aws_glue_catalog_database.main.name}",
          "arn:aws:glue:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${aws_glue_catalog_database.main.name}/${aws_glue_catalog_table.main.name}"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.firehose_logs.arn}:*"
      }
    ]
  })
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}