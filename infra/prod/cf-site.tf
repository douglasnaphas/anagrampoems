module "s3-cf-site" {
  source = "/Users/dougnaphas/repos/terraform-aws-s3-cf-site"
  # version = "0.3.0"
  # insert the 5 required variables here
  bucket_name = var.bucket_name
  cert        = module.acm.cert
  ci_user_arn = var.ci_user_arn
  domain_name = var.domain_name
  zone_name   = var.zone_name
}
