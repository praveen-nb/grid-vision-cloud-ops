# AWS GIS Infrastructure Terraform Configuration

This Terraform configuration deploys a complete AWS infrastructure for the GIS monitoring and analytics platform, supporting multi-tenancy, IoT device management, real-time data processing, and machine learning capabilities.

## Architecture Overview

The infrastructure includes:

- **VPC & Networking**: Multi-AZ VPC with public/private subnets, NAT gateways, and VPC endpoints
- **IoT Core**: Smart meter device management and data ingestion
- **Data Streaming**: Kinesis streams and Firehose for real-time data processing
- **Compute**: Auto-scaling EC2 instances with load balancing
- **Database**: RDS instances for persistent data storage
- **Storage**: S3 buckets for data archiving and tenant isolation
- **Machine Learning**: SageMaker endpoints for AI analytics
- **Security**: WAF, security groups, IAM roles, and encryption
- **Monitoring**: CloudWatch dashboards, alarms, and logging
- **Multi-tenancy**: Isolated resources and permissions per tenant

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **EC2 Key Pair** created in your target region
4. **AWS permissions** for creating all required resources

## Quick Start

1. **Clone and navigate to terraform directory:**
   ```bash
   cd terraform
   ```

2. **Copy and customize variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your specific values
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Plan the deployment:**
   ```bash
   terraform plan
   ```

5. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## Configuration

### Required Variables

Edit `terraform.tfvars` and configure:

- `project_name`: Your project identifier
- `environment`: dev/staging/prod
- `aws_region`: Target AWS region
- `key_pair_name`: EC2 key pair for instance access
- `alert_email`: Email for CloudWatch alerts
- `tenants`: Multi-tenant configuration

### Security Considerations

**IMPORTANT**: Before production deployment:

1. **Restrict CIDR blocks**: Update `allowed_cidr_blocks` to specific IP ranges
2. **Review IAM policies**: Ensure least-privilege access
3. **Enable encryption**: All data at rest and in transit
4. **Configure WAF rules**: Additional web application firewall rules
5. **Set up backup strategies**: RDS automated backups and S3 versioning

## Multi-Tenant Support

Each tenant gets:
- Isolated S3 bucket for data storage
- Dedicated IAM role with scoped permissions
- Separate CloudWatch log groups
- IoT topic namespacing for device isolation

## Cost Estimation

Approximate monthly costs (varies by usage):

- **Compute**: $150-300/month
- **Storage**: $50-100/month  
- **Database**: $30-60/month
- **IoT**: $20-50/month
- **ML**: $100-200/month
- **Total**: $350-710/month

## Modules

- `vpc`: Network infrastructure and subnets
- `security`: Security groups, WAF, and access controls
- `iot`: IoT Core device management and rules
- `streaming`: Kinesis streams and Firehose delivery
- `compute`: EC2 instances and load balancing
- `database`: RDS instances and configurations
- `storage`: S3 buckets and lifecycle policies
- `ml`: SageMaker models and endpoints
- `monitoring`: CloudWatch dashboards and alarms
- `multi-tenant-iam`: Tenant isolation and permissions

## Outputs

After deployment, you'll get:
- VPC and subnet IDs
- EC2 instance IDs and load balancer DNS
- RDS endpoint and connection details
- S3 bucket names and ARNs
- IoT Core endpoint and policies
- SageMaker endpoint information
- CloudWatch dashboard URLs

## Integration with Supabase

This Terraform configuration works alongside your Supabase setup:

1. **Edge Functions**: Can interact with AWS resources using IAM roles
2. **Database**: Stores metadata while AWS handles raw IoT data
3. **Authentication**: Supabase auth with AWS resource access
4. **Real-time**: Supabase realtime + AWS IoT for comprehensive monitoring

## Scaling and Optimization

- **Auto Scaling**: EC2 instances scale based on demand
- **Cost Optimization**: Lifecycle policies for S3 storage classes
- **Performance**: Multi-AZ deployment for high availability
- **Monitoring**: Comprehensive CloudWatch metrics and alarms

## Maintenance

Regular tasks:
- Monitor CloudWatch costs and usage
- Review security group rules
- Update IAM policies as needed
- Scale resources based on growth
- Backup and disaster recovery testing

## Troubleshooting

Common issues:
- **Permission errors**: Check IAM policies and roles
- **Network connectivity**: Verify security groups and NACLs
- **Resource limits**: Check AWS service quotas
- **Cost alerts**: Monitor billing dashboard

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review Terraform state
3. Consult AWS documentation
4. Use AWS support if needed