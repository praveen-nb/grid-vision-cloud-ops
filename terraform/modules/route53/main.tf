# Route53 Hosted Zone (optional - only if managing DNS)
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0
  name  = var.domain_name

  tags = {
    Name = "${var.project_name}-${var.environment}-zone"
  }
}

# Route53 Health Check for the application
resource "aws_route53_health_check" "main" {
  count                           = var.enable_health_checks ? 1 : 0
  fqdn                           = var.cloudfront_domain_name
  port                           = 443
  type                           = "HTTPS"
  resource_path                  = "/health"
  failure_threshold              = "3"
  request_interval               = "30"
  cloudwatch_alarm_region        = var.aws_region
  cloudwatch_alarm_name          = "${var.project_name}-${var.environment}-health-check-alarm"
  measure_latency                = true

  tags = {
    Name = "${var.project_name}-${var.environment}-health-check"
  }
}

# A record pointing to CloudFront distribution
resource "aws_route53_record" "main" {
  count   = var.create_hosted_zone ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = true
  }
}

# AAAA record for IPv6 support
resource "aws_route53_record" "ipv6" {
  count   = var.create_hosted_zone && var.enable_ipv6 ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = true
  }
}

# WWW subdomain redirect
resource "aws_route53_record" "www" {
  count   = var.create_hosted_zone && var.enable_www_redirect ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = true
  }
}

# API subdomain
resource "aws_route53_record" "api" {
  count   = var.create_hosted_zone && var.create_api_subdomain ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = true
  }
}

# MX record for email (optional)
resource "aws_route53_record" "mx" {
  count   = var.create_hosted_zone && length(var.mx_records) > 0 ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 300
  records = var.mx_records
}

# TXT record for domain verification
resource "aws_route53_record" "txt" {
  count   = var.create_hosted_zone && length(var.txt_records) > 0 ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300
  records = var.txt_records
}

# CNAME records for subdomains
resource "aws_route53_record" "cname" {
  for_each = var.create_hosted_zone ? var.cname_records : {}
  zone_id  = aws_route53_zone.main[0].zone_id
  name     = each.key
  type     = "CNAME"
  ttl      = 300
  records  = [each.value]
}

# CloudWatch alarm for health check
resource "aws_cloudwatch_metric_alarm" "health_check" {
  count               = var.enable_health_checks ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-health-check-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "This metric monitors the health check status"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    HealthCheckId = aws_route53_health_check.main[0].id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-health-check-alarm"
  }
}

# Route53 query logging (optional)
resource "aws_route53_query_log" "main" {
  count                    = var.create_hosted_zone && var.enable_query_logging ? 1 : 0
  depends_on               = [aws_cloudwatch_log_group.route53]
  destination_arn          = aws_cloudwatch_log_group.route53[0].arn
  zone_id                  = aws_route53_zone.main[0].zone_id
}

# CloudWatch Log Group for Route53 query logs
resource "aws_cloudwatch_log_group" "route53" {
  count             = var.create_hosted_zone && var.enable_query_logging ? 1 : 0
  name              = "/aws/route53/${var.domain_name}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-route53-logs"
  }
}

# Data source for Route53 CloudFront hosted zone
data "aws_route53_zone" "cloudfront" {
  name         = "cloudfront.net."
  private_zone = false
}