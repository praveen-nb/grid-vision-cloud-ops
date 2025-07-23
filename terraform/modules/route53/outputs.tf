output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : null
}

output "hosted_zone_name_servers" {
  description = "Name servers for the Route53 hosted zone"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : null
}

output "health_check_id" {
  description = "ID of the Route53 health check"
  value       = var.enable_health_checks ? aws_route53_health_check.main[0].id : null
}

output "health_check_fqdn" {
  description = "FQDN of the health check"
  value       = var.enable_health_checks ? aws_route53_health_check.main[0].fqdn : null
}

output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

output "api_subdomain" {
  description = "API subdomain"
  value       = var.create_hosted_zone && var.create_api_subdomain ? "api.${var.domain_name}" : null
}