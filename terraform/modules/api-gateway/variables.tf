variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "health_check_lambda_invoke_arn" {
  description = "ARN for invoking the health check Lambda function"
  type        = string
}

variable "health_check_lambda_function_name" {
  description = "Name of the health check Lambda function"
  type        = string
}