# Terraform configuration for Utility GIS Infrastructure Modernization
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "utility-gis-modernization"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Configuration
resource "aws_vpc" "utility_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Internet Gateway
resource "aws_internet_gateway" "utility_igw" {
  vpc_id = aws_vpc.utility_vpc.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# Public Subnets for Load Balancers
resource "aws_subnet" "public_subnets" {
  count                   = 2
  vpc_id                  = aws_vpc.utility_vpc.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

# Private Subnets for SCADA Systems
resource "aws_subnet" "private_subnets" {
  count             = 2
  vpc_id            = aws_vpc.utility_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-${var.environment}-private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

# NAT Gateway for Private Subnets
resource "aws_eip" "nat_eip" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  count         = 2
  allocation_id = aws_eip.nat_eip[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.utility_igw]
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.utility_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.utility_igw.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

resource "aws_route_table" "private_rt" {
  count  = 2
  vpc_id = aws_vpc.utility_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway[count.index].id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta" {
  count          = 2
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_rta" {
  count          = 2
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rt[count.index].id
}

# Security Groups
resource "aws_security_group" "scada_sg" {
  name_prefix = "${var.project_name}-scada-"
  vpc_id      = aws_vpc.utility_vpc.id

  # SCADA protocols
  ingress {
    from_port   = 502
    to_port     = 502
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Modbus TCP"
  }

  ingress {
    from_port   = 20000
    to_port     = 20000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "DNP3"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-scada-sg"
  }
}

# IoT Core Things and Policies
resource "aws_iot_thing_type" "grid_sensor" {
  name = "${var.project_name}-grid-sensor"

  properties {
    description = "Smart grid sensor devices for utility monitoring"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_iot_policy" "grid_sensor_policy" {
  name = "${var.project_name}-grid-sensor-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iot:Connect",
          "iot:Publish",
          "iot:Subscribe",
          "iot:Receive"
        ]
        Resource = "*"
      }
    ]
  })
}

# Kinesis Data Streams for Real-time Processing
resource "aws_kinesis_stream" "grid_telemetry" {
  name        = "${var.project_name}-grid-telemetry"
  shard_count = 10

  shard_level_metrics = [
    "IncomingRecords",
    "OutgoingRecords",
  ]

  tags = {
    Environment = var.environment
    Purpose     = "Grid Telemetry Data"
  }
}

resource "aws_kinesis_stream" "grid_events" {
  name        = "${var.project_name}-grid-events"
  shard_count = 5

  tags = {
    Environment = var.environment
    Purpose     = "Grid Event Processing"
  }
}

# DynamoDB Tables
resource "aws_dynamodb_table" "grid_metrics" {
  name           = "${var.project_name}-grid-metrics"
  billing_mode   = "ON_DEMAND"
  hash_key       = "device_id"
  range_key      = "timestamp"

  attribute {
    name = "device_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    Purpose     = "Grid Metrics Storage"
  }
}

resource "aws_dynamodb_table" "outage_events" {
  name           = "${var.project_name}-outage-events"
  billing_mode   = "ON_DEMAND"
  hash_key       = "outage_id"

  attribute {
    name = "outage_id"
    type = "S"
  }

  attribute {
    name = "region"
    type = "S"
  }

  attribute {
    name = "severity"
    type = "S"
  }

  global_secondary_index {
    name     = "RegionIndex"
    hash_key = "region"
  }

  global_secondary_index {
    name     = "SeverityIndex"
    hash_key = "severity"
  }

  tags = {
    Environment = var.environment
    Purpose     = "Outage Event Tracking"
  }
}

# S3 Buckets for Data Lake
resource "aws_s3_bucket" "gis_data_lake" {
  bucket = "${var.project_name}-${var.environment}-gis-data-lake"

  tags = {
    Environment = var.environment
    Purpose     = "GIS Data Lake"
  }
}

resource "aws_s3_bucket_versioning" "gis_data_lake_versioning" {
  bucket = aws_s3_bucket.gis_data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "gis_data_lake_encryption" {
  bucket = aws_s3_bucket.gis_data_lake.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# SageMaker Resources
resource "aws_iam_role" "sagemaker_execution_role" {
  name = "${var.project_name}-sagemaker-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "sagemaker_execution_policy" {
  role       = aws_iam_role.sagemaker_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.utility_vpc.id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private_subnets[*].id
}

output "kinesis_stream_names" {
  description = "Names of Kinesis streams"
  value = {
    telemetry = aws_kinesis_stream.grid_telemetry.name
    events    = aws_kinesis_stream.grid_events.name
  }
}

output "dynamodb_table_names" {
  description = "Names of DynamoDB tables"
  value = {
    metrics = aws_dynamodb_table.grid_metrics.name
    outages = aws_dynamodb_table.outage_events.name
  }
}

output "s3_bucket_name" {
  description = "Name of the GIS data lake S3 bucket"
  value       = aws_s3_bucket.gis_data_lake.bucket
}