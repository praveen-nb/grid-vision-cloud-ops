variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tenants" {
  description = "List of tenant configurations"
  type = list(object({
    name        = string
    environment = string
    resources = object({
      ec2_instances = number
      storage_gb    = number
      iot_devices   = number
    })
  }))
}