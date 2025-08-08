# Enhanced VPC Module for Electrical Utility Infrastructure
# Implements comprehensive network segmentation with security zones

# Main VPC
resource "aws_vpc" "enhanced_utility_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
    SecurityZone = "Core"
    Compliance = "NERC-CIP"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.enhanced_utility_vpc.id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
    Environment = var.environment
  }
}

# DMZ Zone Subnets (Public)
resource "aws_subnet" "dmz_public" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.enhanced_utility_vpc.id
  cidr_block        = var.dmz_subnets[count.index]
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-dmz-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "DMZ"
    Tier = "Public"
  }
}

# Application Zone Subnets (Private)
resource "aws_subnet" "app_private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.enhanced_utility_vpc.id
  cidr_block        = var.application_subnets[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-app-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "Application"
    Tier = "Private"
  }
}

# Data Zone Subnets (Private)
resource "aws_subnet" "data_private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.enhanced_utility_vpc.id
  cidr_block        = var.data_subnets[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-data-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "Data"
    Tier = "Private"
  }
}

# Management Zone Subnets (Private)
resource "aws_subnet" "mgmt_private" {
  count = 2 # Only need 2 AZs for management
  
  vpc_id            = aws_vpc.enhanced_utility_vpc.id
  cidr_block        = var.management_subnets[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-mgmt-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "Management"
    Tier = "Private"
  }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat_gateway" {
  count = length(var.availability_zones)
  
  domain = "vpc"
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
  }
  
  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count = length(var.availability_zones)
  
  allocation_id = aws_eip.nat_gateway[count.index].id
  subnet_id     = aws_subnet.dmz_public[count.index].id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-gw-${count.index + 1}"
    Environment = var.environment
  }
  
  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "dmz_public" {
  vpc_id = aws_vpc.enhanced_utility_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-dmz-rt"
    Environment = var.environment
    SecurityZone = "DMZ"
  }
}

resource "aws_route_table" "app_private" {
  count = length(var.availability_zones)
  
  vpc_id = aws_vpc.enhanced_utility_vpc.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-app-rt-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "Application"
  }
}

resource "aws_route_table" "data_private" {
  count = length(var.availability_zones)
  
  vpc_id = aws_vpc.enhanced_utility_vpc.id
  
  # No internet route for data zone
  
  tags = {
    Name = "${var.project_name}-${var.environment}-data-rt-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "Data"
  }
}

resource "aws_route_table" "mgmt_private" {
  count = 2
  
  vpc_id = aws_vpc.enhanced_utility_vpc.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-mgmt-rt-${count.index + 1}"
    Environment = var.environment
    SecurityZone = "Management"
  }
}

# Route Table Associations
resource "aws_route_table_association" "dmz_public" {
  count = length(aws_subnet.dmz_public)
  
  subnet_id      = aws_subnet.dmz_public[count.index].id
  route_table_id = aws_route_table.dmz_public.id
}

resource "aws_route_table_association" "app_private" {
  count = length(aws_subnet.app_private)
  
  subnet_id      = aws_subnet.app_private[count.index].id
  route_table_id = aws_route_table.app_private[count.index].id
}

resource "aws_route_table_association" "data_private" {
  count = length(aws_subnet.data_private)
  
  subnet_id      = aws_subnet.data_private[count.index].id
  route_table_id = aws_route_table.data_private[count.index].id
}

resource "aws_route_table_association" "mgmt_private" {
  count = length(aws_subnet.mgmt_private)
  
  subnet_id      = aws_subnet.mgmt_private[count.index].id
  route_table_id = aws_route_table.mgmt_private[count.index].id
}

# Network ACLs

# DMZ Zone NACL
resource "aws_network_acl" "dmz" {
  vpc_id     = aws_vpc.enhanced_utility_vpc.id
  subnet_ids = aws_subnet.dmz_public[*].id
  
  # Allow HTTPS inbound from internet
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }
  
  # Allow HTTP inbound for redirect
  ingress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }
  
  # Allow SSH from corporate network
  ingress {
    protocol   = "tcp"
    rule_no    = 120
    action     = "allow"
    cidr_block = var.corporate_cidr
    from_port  = 22
    to_port    = 22
  }
  
  # Allow ephemeral ports for return traffic
  ingress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }
  
  # Allow HTTPS outbound to app zone
  egress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = var.app_zone_cidr
    from_port  = 443
    to_port    = 443
  }
  
  # Allow DNS outbound
  egress {
    protocol   = "udp"
    rule_no    = 110
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 53
    to_port    = 53
  }
  
  # Allow ephemeral ports outbound
  egress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-dmz-nacl"
    Environment = var.environment
    SecurityZone = "DMZ"
  }
}

# Application Zone NACL
resource "aws_network_acl" "application" {
  vpc_id     = aws_vpc.enhanced_utility_vpc.id
  subnet_ids = aws_subnet.app_private[*].id
  
  # Allow HTTPS from DMZ
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = var.dmz_zone_cidr
    from_port  = 443
    to_port    = 443
  }
  
  # Allow application port from DMZ
  ingress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = var.dmz_zone_cidr
    from_port  = 8080
    to_port    = 8080
  }
  
  # Allow SSH from management zone
  ingress {
    protocol   = "tcp"
    rule_no    = 120
    action     = "allow"
    cidr_block = var.mgmt_zone_cidr
    from_port  = 22
    to_port    = 22
  }
  
  # Allow ephemeral ports
  ingress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }
  
  # Allow PostgreSQL to data zone
  egress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = var.data_zone_cidr
    from_port  = 5432
    to_port    = 5432
  }
  
  # Allow HTTPS outbound
  egress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }
  
  # Allow ephemeral ports outbound
  egress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-app-nacl"
    Environment = var.environment
    SecurityZone = "Application"
  }
}

# Data Zone NACL
resource "aws_network_acl" "data" {
  vpc_id     = aws_vpc.enhanced_utility_vpc.id
  subnet_ids = aws_subnet.data_private[*].id
  
  # Allow PostgreSQL from application zone
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = var.app_zone_cidr
    from_port  = 5432
    to_port    = 5432
  }
  
  # Allow MySQL from application zone
  ingress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = var.app_zone_cidr
    from_port  = 3306
    to_port    = 3306
  }
  
  # Allow ephemeral ports
  ingress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = var.app_zone_cidr
    from_port  = 1024
    to_port    = 65535
  }
  
  # Allow outbound for managed services
  egress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }
  
  # Allow ephemeral ports outbound
  egress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = var.app_zone_cidr
    from_port  = 1024
    to_port    = 65535
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-data-nacl"
    Environment = var.environment
    SecurityZone = "Data"
  }
}

# VPC Endpoints for Zero-Egress Architecture

# S3 Gateway Endpoint
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.enhanced_utility_vpc.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.s3"
  
  vpc_endpoint_type = "Gateway"
  route_table_ids = concat(
    aws_route_table.app_private[*].id,
    aws_route_table.data_private[*].id,
    aws_route_table.mgmt_private[*].id
  )
  
  tags = {
    Name = "${var.project_name}-${var.environment}-s3-endpoint"
    Environment = var.environment
  }
}

# DynamoDB Gateway Endpoint
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.enhanced_utility_vpc.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  
  vpc_endpoint_type = "Gateway"
  route_table_ids = concat(
    aws_route_table.app_private[*].id,
    aws_route_table.data_private[*].id
  )
  
  tags = {
    Name = "${var.project_name}-${var.environment}-dynamodb-endpoint"
    Environment = var.environment
  }
}

# Interface Endpoints Security Group
resource "aws_security_group" "vpc_endpoints" {
  name_prefix = "${var.project_name}-${var.environment}-vpc-endpoints"
  vpc_id      = aws_vpc.enhanced_utility_vpc.id
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.enhanced_utility_vpc.cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc-endpoints-sg"
    Environment = var.environment
  }
}

# EC2 Interface Endpoint
resource "aws_vpc_endpoint" "ec2" {
  vpc_id              = aws_vpc.enhanced_utility_vpc.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ec2"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.app_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-endpoint"
    Environment = var.environment
  }
}

# SageMaker Interface Endpoint
resource "aws_vpc_endpoint" "sagemaker" {
  vpc_id              = aws_vpc.enhanced_utility_vpc.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.sagemaker.runtime"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.app_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-sagemaker-endpoint"
    Environment = var.environment
  }
}

# CloudWatch Interface Endpoint
resource "aws_vpc_endpoint" "cloudwatch" {
  vpc_id              = aws_vpc.enhanced_utility_vpc.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.monitoring"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.app_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-cloudwatch-endpoint"
    Environment = var.environment
  }
}

# Kinesis Interface Endpoint
resource "aws_vpc_endpoint" "kinesis" {
  vpc_id              = aws_vpc.enhanced_utility_vpc.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.kinesis-streams"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.app_private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-kinesis-endpoint"
    Environment = var.environment
  }
}

# VPC Flow Logs
resource "aws_flow_log" "vpc_flow_logs" {
  iam_role_arn    = aws_iam_role.flow_log_role.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.enhanced_utility_vpc.id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc-flow-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flowlogs/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc-flow-logs"
    Environment = var.environment
  }
}

resource "aws_iam_role" "flow_log_role" {
  name = "${var.project_name}-${var.environment}-flow-log-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name = "${var.project_name}-${var.environment}-flow-log-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "flow_log_policy" {
  name = "${var.project_name}-${var.environment}-flow-log-policy"
  role = aws_iam_role.flow_log_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Data source for current region
data "aws_region" "current" {}