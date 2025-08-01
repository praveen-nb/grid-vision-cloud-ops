output "vpc_endpoint_service_name" {
  description = "VPC Endpoint Service name"
  value       = aws_vpc_endpoint_service.main.service_name
}

output "privatelink_nlb_arn" {
  description = "PrivateLink Network Load Balancer ARN"
  value       = aws_lb.privatelink_nlb.arn
}

output "privatelink_nlb_dns_name" {
  description = "PrivateLink Network Load Balancer DNS name"
  value       = aws_lb.privatelink_nlb.dns_name
}

output "privatelink_security_group_id" {
  description = "Security Group ID for PrivateLink endpoints"
  value       = aws_security_group.privatelink_endpoints.id
}

output "resolver_endpoint_id" {
  description = "Route53 Resolver endpoint ID"
  value       = aws_route53_resolver_endpoint.inbound.id
}

output "target_group_arn" {
  description = "Target Group ARN for internal services"
  value       = aws_lb_target_group.internal_services.arn
}