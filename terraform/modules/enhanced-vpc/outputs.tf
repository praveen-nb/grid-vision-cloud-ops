# Enhanced VPC Outputs

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.enhanced_utility_vpc.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.enhanced_utility_vpc.cidr_block
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

# DMZ Zone Outputs
output "dmz_subnet_ids" {
  description = "IDs of the DMZ (public) subnets"
  value       = aws_subnet.dmz_public[*].id
}

output "dmz_subnet_cidrs" {
  description = "CIDR blocks of the DMZ subnets"
  value       = aws_subnet.dmz_public[*].cidr_block
}

# Application Zone Outputs
output "application_subnet_ids" {
  description = "IDs of the application subnets"
  value       = aws_subnet.app_private[*].id
}

output "application_subnet_cidrs" {
  description = "CIDR blocks of the application subnets"
  value       = aws_subnet.app_private[*].cidr_block
}

# Data Zone Outputs
output "data_subnet_ids" {
  description = "IDs of the data subnets"
  value       = aws_subnet.data_private[*].id
}

output "data_subnet_cidrs" {
  description = "CIDR blocks of the data subnets"
  value       = aws_subnet.data_private[*].cidr_block
}

# Management Zone Outputs
output "management_subnet_ids" {
  description = "IDs of the management subnets"
  value       = aws_subnet.mgmt_private[*].id
}

output "management_subnet_cidrs" {
  description = "CIDR blocks of the management subnets"
  value       = aws_subnet.mgmt_private[*].cidr_block
}

# NAT Gateway Outputs
output "nat_gateway_ids" {
  description = "IDs of the NAT Gateways"
  value       = aws_nat_gateway.main[*].id
}

output "nat_gateway_eips" {
  description = "Elastic IP addresses of the NAT Gateways"
  value       = aws_eip.nat_gateway[*].public_ip
}

# Route Table Outputs
output "dmz_route_table_id" {
  description = "ID of the DMZ route table"
  value       = aws_route_table.dmz_public.id
}

output "application_route_table_ids" {
  description = "IDs of the application route tables"
  value       = aws_route_table.app_private[*].id
}

output "data_route_table_ids" {
  description = "IDs of the data route tables"
  value       = aws_route_table.data_private[*].id
}

output "management_route_table_ids" {
  description = "IDs of the management route tables"
  value       = aws_route_table.mgmt_private[*].id
}

# Security Outputs
output "vpc_endpoints_security_group_id" {
  description = "Security group ID for VPC endpoints"
  value       = aws_security_group.vpc_endpoints.id
}

output "vpc_flow_logs_log_group_name" {
  description = "CloudWatch log group name for VPC flow logs"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.name
}

# Network ACL Outputs
output "dmz_nacl_id" {
  description = "ID of the DMZ Network ACL"
  value       = aws_network_acl.dmz.id
}

output "application_nacl_id" {
  description = "ID of the Application Network ACL"
  value       = aws_network_acl.application.id
}

output "data_nacl_id" {
  description = "ID of the Data Network ACL"
  value       = aws_network_acl.data.id
}

# VPC Endpoint Outputs
output "s3_vpc_endpoint_id" {
  description = "ID of the S3 VPC endpoint"
  value       = aws_vpc_endpoint.s3.id
}

output "dynamodb_vpc_endpoint_id" {
  description = "ID of the DynamoDB VPC endpoint"
  value       = aws_vpc_endpoint.dynamodb.id
}

output "ec2_vpc_endpoint_id" {
  description = "ID of the EC2 VPC endpoint"
  value       = aws_vpc_endpoint.ec2.id
}

output "sagemaker_vpc_endpoint_id" {
  description = "ID of the SageMaker VPC endpoint"
  value       = aws_vpc_endpoint.sagemaker.id
}

output "cloudwatch_vpc_endpoint_id" {
  description = "ID of the CloudWatch VPC endpoint"
  value       = aws_vpc_endpoint.cloudwatch.id
}

output "kinesis_vpc_endpoint_id" {
  description = "ID of the Kinesis VPC endpoint"
  value       = aws_vpc_endpoint.kinesis.id
}

# Availability Zone Mapping
output "availability_zones" {
  description = "List of availability zones used"
  value       = var.availability_zones
}

output "subnet_az_mapping" {
  description = "Mapping of subnets to availability zones"
  value = {
    dmz = {
      for i, az in var.availability_zones : az => aws_subnet.dmz_public[i].id
    }
    application = {
      for i, az in var.availability_zones : az => aws_subnet.app_private[i].id
    }
    data = {
      for i, az in var.availability_zones : az => aws_subnet.data_private[i].id
    }
    management = {
      for i, az in slice(var.availability_zones, 0, 2) : az => aws_subnet.mgmt_private[i].id
    }
  }
}

# Security Zone Information
output "security_zones" {
  description = "Security zone configuration"
  value = {
    dmz = {
      name = "DMZ"
      tier = "Public"
      subnets = aws_subnet.dmz_public[*].id
      route_table = aws_route_table.dmz_public.id
      nacl = aws_network_acl.dmz.id
    }
    application = {
      name = "Application"
      tier = "Private"
      subnets = aws_subnet.app_private[*].id
      route_tables = aws_route_table.app_private[*].id
      nacl = aws_network_acl.application.id
    }
    data = {
      name = "Data"
      tier = "Private"
      subnets = aws_subnet.data_private[*].id
      route_tables = aws_route_table.data_private[*].id
      nacl = aws_network_acl.data.id
    }
    management = {
      name = "Management"
      tier = "Private"
      subnets = aws_subnet.mgmt_private[*].id
      route_tables = aws_route_table.mgmt_private[*].id
    }
  }
}