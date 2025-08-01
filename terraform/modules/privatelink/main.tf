# PrivateLink module for Zero Trust external connectivity

# VPC Endpoint Service for external connections
resource "aws_vpc_endpoint_service" "main" {
  acceptance_required        = true
  network_load_balancer_arns = [var.nlb_arn]

  tags = {
    Name = "${var.project_name}-${var.environment}-privatelink-service"
  }
}

# Network Load Balancer for PrivateLink
resource "aws_lb" "privatelink_nlb" {
  name               = "${var.project_name}-${var.environment}-pl-nlb"
  internal           = true
  load_balancer_type = "network"
  subnets            = var.private_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-${var.environment}-privatelink-nlb"
  }
}

# Target Group for internal services
resource "aws_lb_target_group" "internal_services" {
  name     = "${var.project_name}-${var.environment}-internal-tg"
  port     = 443
  protocol = "TCP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTPS"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-internal-tg"
  }
}

# Listener for NLB
resource "aws_lb_listener" "privatelink" {
  load_balancer_arn = aws_lb.privatelink_nlb.arn
  port              = "443"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.internal_services.arn
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-privatelink-listener"
  }
}

# Security Group for PrivateLink endpoints
resource "aws_security_group" "privatelink_endpoints" {
  name        = "${var.project_name}-${var.environment}-privatelink-sg"
  description = "Security group for PrivateLink endpoints"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTPS from trusted networks"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  ingress {
    description = "HTTP from trusted networks"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-privatelink-sg"
  }
}

# VPC Endpoint for external partner connections
resource "aws_vpc_endpoint" "partner_connection" {
  count = length(var.partner_services)

  vpc_id              = var.vpc_id
  service_name        = var.partner_services[count.index].service_name
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.private_subnet_ids
  security_group_ids  = [aws_security_group.privatelink_endpoints.id]
  private_dns_enabled = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "execute-api:Invoke"
        ]
        Resource = var.partner_services[count.index].resource_arn
        Condition = {
          StringEquals = {
            "aws:PrincipalVpc" = var.vpc_id
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-partner-endpoint-${count.index}"
  }
}

# Route53 Resolver for private DNS
resource "aws_route53_resolver_endpoint" "inbound" {
  name      = "${var.project_name}-${var.environment}-resolver-inbound"
  direction = "INBOUND"

  security_group_ids = [aws_security_group.resolver.id]

  dynamic "ip_address" {
    for_each = var.private_subnet_ids
    content {
      subnet_id = ip_address.value
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-resolver-inbound"
  }
}

# Security Group for Route53 Resolver
resource "aws_security_group" "resolver" {
  name        = "${var.project_name}-${var.environment}-resolver-sg"
  description = "Security group for Route53 Resolver"
  vpc_id      = var.vpc_id

  ingress {
    description = "DNS from VPC"
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  ingress {
    description = "DNS from VPC"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-resolver-sg"
  }
}

# CloudWatch Log Group for PrivateLink
resource "aws_cloudwatch_log_group" "privatelink" {
  name              = "/aws/privatelink/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-privatelink-logs"
  }
}

# VPC Flow Logs for PrivateLink monitoring
resource "aws_flow_log" "privatelink_flow_logs" {
  iam_role_arn    = aws_iam_role.privatelink_flow_log.arn
  log_destination = aws_cloudwatch_log_group.privatelink.arn
  traffic_type    = "ALL"
  vpc_id          = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-privatelink-flow-logs"
  }
}

# IAM Role for PrivateLink Flow Logs
resource "aws_iam_role" "privatelink_flow_log" {
  name = "${var.project_name}-${var.environment}-privatelink-flow-log-role"

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
}

# IAM Policy for PrivateLink Flow Logs
resource "aws_iam_role_policy" "privatelink_flow_log" {
  name = "${var.project_name}-${var.environment}-privatelink-flow-log-policy"
  role = aws_iam_role.privatelink_flow_log.id

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