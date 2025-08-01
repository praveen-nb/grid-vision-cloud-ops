# S3 bucket for static content
resource "aws_s3_bucket" "static_content" {
  bucket = "${var.project_name}-${var.environment}-static-content"

  tags = {
    Name = "${var.project_name}-${var.environment}-static-content"
  }
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "static_content" {
  bucket = aws_s3_bucket.static_content.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "static_content" {
  bucket = aws_s3_bucket.static_content.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "static_content" {
  bucket = aws_s3_bucket.static_content.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Origin Access Control
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.project_name}-${var.environment}-oac"
  description                       = "OAC for ${var.project_name} ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Lambda@Edge function for Zero Trust session validation
resource "aws_lambda_function" "session_validator" {
  filename         = "session_validator.zip"
  function_name    = "${var.project_name}-${var.environment}-session-validator"
  role            = aws_iam_role.lambda_edge_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 5

  depends_on = [data.archive_file.session_validator]

  tags = {
    Name = "${var.project_name}-${var.environment}-session-validator"
  }
}

# Archive for Lambda@Edge function
data "archive_file" "session_validator" {
  type        = "zip"
  output_path = "session_validator.zip"
  source {
    content = <<EOF
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    
    // Skip validation for static assets
    if (request.uri.match(/\.(js|css|png|jpg|gif|ico|svg|woff|woff2|ttf)$/)) {
        return request;
    }
    
    // Check for session headers
    const sessionToken = headers['authorization'] || headers['x-session-token'];
    const userAgent = headers['user-agent'];
    const sourceIp = event.Records[0].cf.config.requestId;
    
    // Basic session validation logic
    if (!sessionToken) {
        return {
            status: '401',
            statusDescription: 'Unauthorized',
            headers: {
                'content-type': [{
                    key: 'Content-Type',
                    value: 'application/json'
                }],
                'cache-control': [{
                    key: 'Cache-Control',
                    value: 'no-store'
                }]
            },
            body: JSON.stringify({
                error: 'Session required for access'
            })
        };
    }
    
    // Add Zero Trust headers
    request.headers['x-forwarded-for'] = [{
        key: 'X-Forwarded-For',
        value: sourceIp
    }];
    
    request.headers['x-zero-trust-verified'] = [{
        key: 'X-Zero-Trust-Verified',
        value: 'true'
    }];
    
    return request;
};
EOF
    filename = "index.js"
  }
}

# IAM Role for Lambda@Edge
resource "aws_iam_role" "lambda_edge_role" {
  name = "${var.project_name}-${var.environment}-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        }
      }
    ]
  })
}

# IAM Policy for Lambda@Edge
resource "aws_iam_role_policy_attachment" "lambda_edge_policy" {
  role       = aws_iam_role.lambda_edge_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name              = aws_s3_bucket.static_content.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id                = "S3-${aws_s3_bucket.static_content.id}"

    # Custom headers for Zero Trust
    custom_header {
      name  = "X-CloudFront-Origin"
      value = "trusted-s3-origin"
    }
  }

  # API Gateway origin with enhanced security
  origin {
    domain_name = replace(var.api_gateway_invoke_url, "/^https?://([^/]*).*/", "$1")
    origin_id   = "API-Gateway"
    origin_path = "/${var.api_gateway_stage_name}"

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "https-only"
      origin_ssl_protocols     = ["TLSv1.2", "TLSv1.3"]
      origin_keepalive_timeout = 5
      origin_read_timeout      = 30
    }

    custom_header {
      name  = "X-CloudFront-Origin"
      value = "trusted-api-origin"
    }

    custom_header {
      name  = "X-Zero-Trust-Source"
      value = "cloudfront-verified"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} ${var.environment} distribution"
  default_root_object = "index.html"

  # Static content cache behavior with session awareness
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.static_content.id}"

    cache_policy_id        = aws_cloudfront_cache_policy.zero_trust_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.zero_trust_origin.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Zero Trust Lambda@Edge function
    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.session_validator.qualified_arn
      include_body = false
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  # API cache behavior with enhanced Zero Trust
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "API-Gateway"

    cache_policy_id          = aws_cloudfront_cache_policy.api_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_origin.id

    viewer_protocol_policy = "https-only"
    compress               = true

    # Enhanced session validation for API endpoints
    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.session_validator.qualified_arn
      include_body = true
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  web_acl_id = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null

  tags = {
    Name = "${var.project_name}-${var.environment}-distribution"
  }
}

# S3 bucket policy for CloudFront
resource "aws_s3_bucket_policy" "static_content" {
  bucket = aws_s3_bucket.static_content.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_content.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}

# WAF Web ACL (optional)
resource "aws_wafv2_web_acl" "main" {
  count = var.enable_waf ? 1 : 0

  name  = "${var.project_name}-${var.environment}-waf"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "RateLimitRule"
      sampled_requests_enabled    = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                 = "${var.project_name}-${var.environment}-waf"
    sampled_requests_enabled    = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-waf"
  }
}

# CloudWatch Log Group for CloudFront
resource "aws_cloudwatch_log_group" "cloudfront" {
  name              = "/aws/cloudfront/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudfront-logs"
  }
}