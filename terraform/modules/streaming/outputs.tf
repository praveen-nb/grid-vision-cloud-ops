output "kinesis_stream_name" {
  description = "Name of the Kinesis stream"
  value       = aws_kinesis_stream.main.name
}

output "kinesis_stream_arn" {
  description = "ARN of the Kinesis stream"
  value       = aws_kinesis_stream.main.arn
}

output "firehose_delivery_stream_name" {
  description = "Name of the Kinesis Firehose delivery stream"
  value       = aws_kinesis_firehose_delivery_stream.main.name
}

output "data_archive_bucket_name" {
  description = "Name of the S3 data archive bucket"
  value       = aws_s3_bucket.data_archive.bucket
}

output "glue_database_name" {
  description = "Name of the Glue catalog database"
  value       = aws_glue_catalog_database.main.name
}

output "glue_table_name" {
  description = "Name of the Glue catalog table"
  value       = aws_glue_catalog_table.main.name
}