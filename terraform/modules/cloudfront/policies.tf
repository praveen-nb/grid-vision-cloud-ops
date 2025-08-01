# Cache Policy for Zero Trust static content
resource "aws_cloudfront_cache_policy" "zero_trust_cache" {
  name        = "${var.project_name}-${var.environment}-zero-trust-cache"
  comment     = "Cache policy for Zero Trust static content"
  default_ttl = 3600
  max_ttl     = 86400
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "none"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "X-Session-Token", "X-User-ID"]
      }
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# Cache Policy for API endpoints
resource "aws_cloudfront_cache_policy" "api_cache" {
  name        = "${var.project_name}-${var.environment}-api-cache"
  comment     = "Cache policy for API endpoints with Zero Trust"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "all"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = [
          "Authorization",
          "Content-Type",
          "X-Session-Token",
          "X-User-ID",
          "X-Request-ID",
          "X-Zero-Trust-Context"
        ]
      }
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# Origin Request Policy for Zero Trust
resource "aws_cloudfront_origin_request_policy" "zero_trust_origin" {
  name    = "${var.project_name}-${var.environment}-zero-trust-origin"
  comment = "Origin request policy for Zero Trust"

  query_strings_config {
    query_string_behavior = "none"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Authorization",
        "X-Session-Token",
        "X-User-ID",
        "X-Zero-Trust-Verified",
        "X-CloudFront-Origin"
      ]
    }
  }

  cookies_config {
    cookie_behavior = "none"
  }
}

# Origin Request Policy for API
resource "aws_cloudfront_origin_request_policy" "api_origin" {
  name    = "${var.project_name}-${var.environment}-api-origin"
  comment = "Origin request policy for API with Zero Trust"

  query_strings_config {
    query_string_behavior = "all"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Authorization",
        "Content-Type",
        "X-Session-Token",
        "X-User-ID",
        "X-Request-ID",
        "X-Zero-Trust-Context",
        "X-Zero-Trust-Verified",
        "X-CloudFront-Origin",
        "X-Zero-Trust-Source"
      ]
    }
  }

  cookies_config {
    cookie_behavior = "none"
  }
}

# Response Headers Policy for Security
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project_name}-${var.environment}-security-headers"
  comment = "Security headers for Zero Trust architecture"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
    }
  }

  custom_headers_config {
    items {
      header   = "X-Zero-Trust-Policy"
      value    = "enforced"
      override = true
    }

    items {
      header   = "X-Content-Security-Policy"
      value    = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
      override = true
    }

    items {
      header   = "X-Session-Validation"
      value    = "required"
      override = true
    }

    items {
      header   = "Permissions-Policy"
      value    = "geolocation=(), microphone=(), camera=()"
      override = true
    }
  }
}