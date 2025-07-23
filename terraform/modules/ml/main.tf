# SageMaker Execution Role
resource "aws_iam_role" "sagemaker_role" {
  name = "${var.project_name}-${var.environment}-sagemaker-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "sagemaker_policy" {
  role       = aws_iam_role.sagemaker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

# SageMaker Model (placeholder)
resource "aws_sagemaker_model" "main" {
  name               = "${var.project_name}-${var.environment}-model"
  execution_role_arn = aws_iam_role.sagemaker_role.arn

  primary_container {
    image = "382416733822.dkr.ecr.us-east-1.amazonaws.com/xgboost:latest"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-model"
  }
}