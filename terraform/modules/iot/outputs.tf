output "iot_endpoint" {
  description = "IoT Core endpoint"
  value       = data.aws_iot_endpoint.endpoint.endpoint_url
}

output "iot_policy_arn" {
  description = "ARN of the IoT policy"
  value       = aws_iot_policy.smart_meter_policy.arn
}

output "thing_type_name" {
  description = "Name of the IoT thing type"
  value       = aws_iot_thing_type.smart_meter.name
}

output "topic_rule_arn" {
  description = "ARN of the IoT topic rule"
  value       = aws_iot_topic_rule.smart_meter_data.arn
}

# Data source for IoT endpoint
data "aws_iot_endpoint" "endpoint" {
  endpoint_type = "iot:Data-ATS"
}