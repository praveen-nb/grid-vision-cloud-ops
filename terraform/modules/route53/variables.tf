variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "Whether to create a Route53 hosted zone"
  type        = bool
  default     = false
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "CloudFront distribution zone ID"
  type        = string
  default     = "Z2FDTNDATAQYW2"  # CloudFront default zone ID
}

variable "enable_health_checks" {
  description = "Enable Route53 health checks"
  type        = bool
  default     = true
}

variable "enable_ipv6" {
  description = "Enable IPv6 AAAA records"
  type        = bool
  default     = true
}

variable "enable_www_redirect" {
  description = "Enable www subdomain redirect"
  type        = bool
  default     = true
}

variable "create_api_subdomain" {
  description = "Create API subdomain"
  type        = bool
  default     = true
}

variable "enable_query_logging" {
  description = "Enable Route53 query logging"
  type        = bool
  default     = false
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for health check alarms"
  type        = string
  default     = ""
}

variable "mx_records" {
  description = "List of MX records"
  type        = list(string)
  default     = []
}

variable "txt_records" {
  description = "List of TXT records"
  type        = list(string)
  default     = []
}

variable "cname_records" {
  description = "Map of CNAME records"
  type        = map(string)
  default     = {}
}