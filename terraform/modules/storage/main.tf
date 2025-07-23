# Main S3 bucket for application data
resource "aws_s3_bucket" "main" {
  bucket = "${var.project_name}-${var.environment}-main-storage"

  tags = {
    Name = "${var.project_name}-${var.environment}-main-storage"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}