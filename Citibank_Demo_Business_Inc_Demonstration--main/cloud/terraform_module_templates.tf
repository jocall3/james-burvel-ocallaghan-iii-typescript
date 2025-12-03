#
# terraform_module_templates.tf
#
# This file provides template Terraform modules for AI-generated
# cloud infrastructure deployments. These templates adhere to best practices
# for cost optimization, security, and resilience, reflecting the capabilities
# of the 'Cloud - The Aetherium' module, which autonomously generates
# production-ready Infrastructure-as-Code.
#

# ----------------------------------------------------------------------------------------------------------------------
# TEMPLATE: HIGHLY AVAILABLE WEB APPLICATION CLUSTER (AWS)
#
# This section defines a Terraform module template for deploying a highly available,
# scalable web application cluster on AWS. It includes VPC networking, an Application
# Load Balancer (ALB), an Auto Scaling Group (ASG) for compute, and an Amazon RDS
# PostgreSQL database. This template demonstrates the AI's ability to provision
# robust and scalable application infrastructure adhering to best practices.
# ----------------------------------------------------------------------------------------------------------------------

# Common Variables for the Web Application Cluster
variable "web_app_cluster_environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "web_app_cluster_project_name" {
  description = "The name of the project associated with this deployment."
  type        = string
}

variable "web_app_cluster_region" {
  description = "The AWS region to deploy resources into."
  type        = string
  default     = "us-east-1"
}

variable "web_app_cluster_vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "web_app_cluster_public_subnet_cidrs" {
  description = "A list of CIDR blocks for public subnets (e.g., for ALB)."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "web_app_cluster_private_subnet_cidrs" {
  description = "A list of CIDR blocks for private subnets (e.g., for EC2, RDS)."
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "web_app_cluster_instance_type" {
  description = "The EC2 instance type for the web application servers."
  type        = string
  default     = "t3.medium"
}

variable "web_app_cluster_ami_id" {
  description = "The AMI ID for the EC2 instances (e.g., Amazon Linux 2)."
  type        = string
  default     = "ami-0abcdef1234567890" # Placeholder: Replace with a valid AMI ID
}

variable "web_app_cluster_key_pair_name" {
  description = "The name of the EC2 Key Pair to allow SSH access to instances."
  type        = string
  default     = "your-ec2-keypair" # Placeholder: Replace with your EC2 Key Pair
}

variable "web_app_cluster_db_instance_type" {
  description = "The RDS DB instance type."
  type        = string
  default     = "db.t3.medium"
}

variable "web_app_cluster_db_username" {
  description = "The master username for the RDS database."
  type        = string
}

variable "web_app_cluster_db_password" {
  description = "The master password for the RDS database."
  type        = string
  sensitive   = true # Mark as sensitive to prevent logging
}

variable "web_app_cluster_db_name" {
  description = "The name of the database to create."
  type        = string
  default     = "webappdb"
}

variable "web_app_cluster_desired_capacity" {
  description = "Desired number of instances in the Auto Scaling Group."
  type        = number
  default     = 2
}

variable "web_app_cluster_max_capacity" {
  description = "Maximum number of instances in the Auto Scaling Group."
  type        = number
  default     = 4
}

# Web Application Cluster Resources
resource "aws_vpc" "web_app_cluster_vpc" {
  cidr_block = var.web_app_cluster_vpc_cidr
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-vpc"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_internet_gateway" "web_app_cluster_igw" {
  vpc_id = aws_vpc.web_app_cluster_vpc.id
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-igw"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_subnet" "web_app_cluster_public" {
  count             = length(var.web_app_cluster_public_subnet_cidrs)
  vpc_id            = aws_vpc.web_app_cluster_vpc.id
  cidr_block        = var.web_app_cluster_public_subnet_cidrs[count.index]
  availability_zone = "${var.web_app_cluster_region}${format("%c", 97 + count.index)}" # e.g., us-east-1a, us-east-1b
  map_public_ip_on_launch = true # Public subnets for internet-facing resources like ALB
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-public-subnet-${count.index}"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_route_table" "web_app_cluster_public_rt" {
  vpc_id = aws_vpc.web_app_cluster_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.web_app_cluster_igw.id
  }
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-public-rt"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_route_table_association" "web_app_cluster_public_rta" {
  count          = length(aws_subnet.web_app_cluster_public)
  subnet_id      = aws_subnet.web_app_cluster_public[count.index].id
  route_table_id = aws_route_table.web_app_cluster_public_rt.id
}

resource "aws_subnet" "web_app_cluster_private" {
  count             = length(var.web_app_cluster_private_subnet_cidrs)
  vpc_id            = aws_vpc.web_app_cluster_vpc.id
  cidr_block        = var.web_app_cluster_private_subnet_cidrs[count.index]
  availability_zone = "${var.web_app_cluster_region}${format("%c", 97 + count.index)}" # e.g., us-east-1a, us-east-1b
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-private-subnet-${count.index}"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_eip" "web_app_cluster_nat_eip" {
  count  = length(var.web_app_cluster_public_subnet_cidrs) > 0 ? length(var.web_app_cluster_private_subnet_cidrs) : 0 # Only create if public subnets exist for NAT
  domain = "vpc"
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-nat-eip-${count.index}"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_nat_gateway" "web_app_cluster_nat" {
  count         = length(aws_eip.web_app_cluster_nat_eip) # Only create if EIPs were created
  allocation_id = aws_eip.web_app_cluster_nat_eip[count.index].id
  subnet_id     = aws_subnet.web_app_cluster_public[count.index].id # Associate NAT Gateway with a public subnet
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-nat-${count.index}"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_route_table" "web_app_cluster_private_rt" {
  count  = length(var.web_app_cluster_private_subnet_cidrs)
  vpc_id = aws_vpc.web_app_cluster_vpc.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.web_app_cluster_nat[count.index].id
  }
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-private-rt-${count.index}"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_route_table_association" "web_app_cluster_private_rta" {
  count          = length(aws_subnet.web_app_cluster_private)
  subnet_id      = aws_subnet.web_app_cluster_private[count.index].id
  route_table_id = aws_route_table.web_app_cluster_private_rt[count.index].id
}

resource "aws_security_group" "web_app_cluster_alb_sg" {
  name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-alb-sg"
  description = "Allow HTTP/S traffic to ALB from anywhere"
  vpc_id      = aws_vpc.web_app_cluster_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow all outbound traffic
  }
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-alb-sg"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_security_group" "web_app_cluster_app_sg" {
  name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-app-sg"
  description = "Allow traffic from ALB to application instances and outbound to internet"
  vpc_id      = aws_vpc.web_app_cluster_vpc.id

  ingress {
    from_port       = 8080 # Example application port
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web_app_cluster_alb_sg.id]
    description     = "Allow traffic from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow outbound to internet (e.g., for updates, external APIs)
  }
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-app-sg"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_security_group" "web_app_cluster_db_sg" {
  name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-sg"
  description = "Allow traffic from application instances to RDS database"
  vpc_id      = aws_vpc.web_app_cluster_vpc.id

  ingress {
    from_port       = 5432 # PostgreSQL default port
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_app_cluster_app_sg.id]
    description     = "Allow traffic from application instances"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow outbound traffic (e.g., for database updates)
  }
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-sg"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_lb" "web_app_cluster_alb" {
  name               = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web_app_cluster_alb_sg.id]
  subnets            = [for s in aws_subnet.web_app_cluster_public : s.id]

  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-alb"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_lb_target_group" "web_app_cluster_tg" {
  name     = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-tg"
  port     = 8080 # Target application port on instances
  protocol = "HTTP"
  vpc_id   = aws_vpc.web_app_cluster_vpc.id

  health_check {
    path                = "/health" # Example health check path for the application
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-tg"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_lb_listener" "web_app_cluster_http_listener" {
  load_balancer_arn = aws_lb.web_app_cluster_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_app_cluster_tg.arn
  }
}

resource "aws_launch_template" "web_app_cluster_lt" {
  name_prefix   = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-lt"
  image_id      = var.web_app_cluster_ami_id
  instance_type = var.web_app_cluster_instance_type
  key_name      = var.web_app_cluster_key_pair_name
  vpc_security_group_ids = [aws_security_group.web_app_cluster_app_sg.id]

  # Example user data script for a simple web server setup
  user_data = base64encode(<<EOF
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from ${var.web_app_cluster_project_name} in ${var.web_app_cluster_environment}!</h1>" > /var/www/html/index.html
# Placeholder for actual application deployment or configuration
EOF
  )
  monitoring {
    enabled = true # Enable detailed monitoring for better AI insights
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-instance"
      Environment = var.web_app_cluster_environment
      Project     = var.web_app_cluster_project_name
      ManagedBy   = "AI-IaC-CoPilot"
    }
  }
}

resource "aws_autoscaling_group" "web_app_cluster_asg" {
  name                      = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-asg"
  vpc_zone_identifier       = [for s in aws_subnet.web_app_cluster_private : s.id] # Deploy in private subnets
  desired_capacity          = var.web_app_cluster_desired_capacity
  max_size                  = var.web_app_cluster_max_capacity
  min_size                  = var.web_app_cluster_desired_capacity
  target_group_arns         = [aws_lb_target_group.web_app_cluster_tg.arn]
  health_check_type         = "ELB" # Use ALB health checks
  health_check_grace_period = 300 # 5 minutes grace period for instance startup

  launch_template {
    id      = aws_launch_template.web_app_cluster_lt.id
    version = "$Latest" # Always use the latest version of the launch template
  }

  tag {
    key                 = "Name"
    value               = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-asg-instance"
    propagate_at_launch = true
  }
  tag {
    key                 = "Environment"
    value               = var.web_app_cluster_environment
    propagate_at_launch = true
  }
  tag {
    key                 = "Project"
    value               = var.web_app_cluster_project_name
    propagate_at_launch = true
  }
  tag {
    key                 = "ManagedBy"
    value               = "AI-IaC-CoPilot"
    propagate_at_launch = true
  }
}

resource "aws_db_subnet_group" "web_app_cluster_db_subnet_group" {
  name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-subnet-group"
  subnet_ids  = [for s in aws_subnet.web_app_cluster_private : s.id] # RDS in private subnets
  description = "A group of private subnets for RDS instances."
  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-subnet-group"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_rds_cluster" "web_app_cluster_db" {
  cluster_identifier = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-cluster"
  engine             = "aurora-postgresql"
  engine_version     = "13.9" # Specify a stable engine version
  database_name      = var.web_app_cluster_db_name
  master_username    = var.web_app_cluster_db_username
  master_password    = var.web_app_cluster_db_password
  db_subnet_group_name = aws_db_subnet_group.web_app_cluster_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.web_app_cluster_db_sg.id]
  skip_final_snapshot    = true # Set to false for production environments to enable backups
  backup_retention_period = 7 # Example: 7 days backup retention
  preferred_backup_window = "03:00-05:00"

  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-cluster"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_rds_cluster_instance" "web_app_cluster_db_instances" {
  count              = 2 # Deploy 2 instances for multi-AZ high availability
  identifier         = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.web_app_cluster_db.id
  instance_class     = var.web_app_cluster_db_instance_type
  engine             = aws_rds_cluster.web_app_cluster_db.engine
  engine_version     = aws_rds_cluster.web_app_cluster_db.engine_version
  publicly_accessible = false # Ensure DB is not publicly accessible
  db_subnet_group_name = aws_db_subnet_group.web_app_cluster_db_subnet_group.name

  tags = {
    Name        = "${var.web_app_cluster_project_name}-${var.web_app_cluster_environment}-db-instance-${count.index}"
    Environment = var.web_app_cluster_environment
    Project     = var.web_app_cluster_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

# Web Application Cluster Outputs
output "web_app_cluster_alb_dns_name" {
  description = "The DNS name of the Application Load Balancer for the web application."
  value       = aws_lb.web_app_cluster_alb.dns_name
}

output "web_app_cluster_rds_endpoint" {
  description = "The endpoint address of the RDS PostgreSQL database cluster."
  value       = aws_rds_cluster.web_app_cluster_db.endpoint
  sensitive   = true
}

output "web_app_cluster_vpc_id" {
  description = "The ID of the VPC created for the web application cluster."
  value       = aws_vpc.web_app_cluster_vpc.id
}

output "web_app_cluster_public_subnet_ids" {
  description = "A list of public subnet IDs where the ALB is deployed."
  value       = [for s in aws_subnet.web_app_cluster_public : s.id]
}

output "web_app_cluster_private_subnet_ids" {
  description = "A list of private subnet IDs where application instances and database are deployed."
  value       = [for s in aws_subnet.web_app_cluster_private : s.id]
}


# ----------------------------------------------------------------------------------------------------------------------
# TEMPLATE: COMPLIANT S3 STORAGE BUCKET (AWS)
#
# This section defines a Terraform module template for deploying an AWS S3 bucket
# with best practices for security, data governance, and cost optimization.
# It includes versioning, default server-side encryption, comprehensive public access
# blocking, enforced bucket ownership, and intelligent lifecycle management rules
# for smart-tiering and data retention. This aligns with the 'Storage - The Great Library'
# module's capabilities for self-optimizing data repositories.
# ----------------------------------------------------------------------------------------------------------------------

# Common Variables for the Compliant S3 Storage Bucket
variable "s3_bucket_name" {
  description = "The name of the S3 bucket to create. Must be globally unique."
  type        = string
}

variable "s3_bucket_environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "s3_bucket_project_name" {
  description = "The name of the project associated with this S3 bucket."
  type        = string
}

variable "s3_bucket_versioning_enabled" {
  description = "Whether to enable versioning for the S3 bucket. Recommended for data protection."
  type        = bool
  default     = true
}

variable "s3_bucket_encryption_algorithm" {
  description = "The server-side encryption algorithm to use (e.g., AES256, aws:kms)."
  type        = string
  default     = "AES256"
}

variable "s3_bucket_force_destroy" {
  description = "A boolean that indicates if the bucket should be destroyed even when it contains objects. Set to `false` in production for safety."
  type        = bool
  default     = false
}

variable "s3_bucket_transition_to_standard_ia_days" {
  description = "Number of days after which to transition objects to STANDARD_IA storage class."
  type        = number
  default     = 30
}

variable "s3_bucket_transition_to_glacier_days" {
  description = "Number of days after which to transition objects to GLACIER storage class."
  type        = number
  default     = 90
}

variable "s3_bucket_expire_after_days" {
  description = "Number of days after which to expire objects (delete them) completely."
  type        = number
  default     = 365
}

# Compliant S3 Storage Bucket Resources
resource "aws_s3_bucket" "compliant_s3_bucket" {
  bucket = var.s3_bucket_name
  force_destroy = var.s3_bucket_force_destroy # Control bucket destruction with content

  tags = {
    Name        = "${var.s3_bucket_project_name}-${var.s3_bucket_environment}-data-bucket"
    Environment = var.s3_bucket_environment
    Project     = var.s3_bucket_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

resource "aws_s3_bucket_versioning" "compliant_s3_bucket_versioning" {
  bucket = aws_s3_bucket.compliant_s3_bucket.id
  versioning_configuration {
    status = var.s3_bucket_versioning_enabled ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "compliant_s3_bucket_encryption" {
  bucket = aws_s3_bucket.compliant_s3_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = var.s3_bucket_encryption_algorithm
    }
  }
}

resource "aws_s3_bucket_public_access_block" "compliant_s3_bucket_public_access" {
  bucket = aws_s3_bucket.compliant_s3_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true # Enforce no public access for robust security
}

resource "aws_s3_bucket_ownership_controls" "compliant_s3_bucket_ownership" {
  bucket = aws_s3_bucket.compliant_s3_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced" # Ensure bucket owner has full control
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "compliant_s3_bucket_lifecycle" {
  bucket = aws_s3_bucket.compliant_s3_bucket.id

  rule {
    id     = "smart_tiering_and_expiration"
    status = "Enabled"

    # Transition to Infrequent Access (IA) for cost savings after 30 days
    transition {
      days          = var.s3_bucket_transition_to_standard_ia_days
      storage_class = "STANDARD_IA"
    }

    # Transition to Glacier for long-term archiving after 90 days
    transition {
      days          = var.s3_bucket_transition_to_glacier_days
      storage_class = "GLACIER"
    }

    # Expire objects after one year to manage data growth and compliance
    expiration {
      days = var.s3_bucket_expire_after_days
    }

    # Noncurrent version expiration for versioned buckets
    noncurrent_version_expiration {
      noncurrent_days = var.s3_bucket_expire_after_days
    }
  }
}

# Compliant S3 Storage Bucket Outputs
output "s3_bucket_arn" {
  description = "The ARN of the compliant S3 bucket."
  value       = aws_s3_bucket.compliant_s3_bucket.arn
}

output "s3_bucket_id" {
  description = "The ID (name) of the compliant S3 bucket."
  value       = aws_s3_bucket.compliant_s3_bucket.id
}


# ----------------------------------------------------------------------------------------------------------------------
# TEMPLATE: DEDICATED NETWORK SECURITY GROUP (AWS)
#
# This section defines a Terraform module template for a dedicated AWS Security Group,
# allowing granular control over inbound (ingress) and outbound (egress) traffic.
# This template showcases the AI's ability to generate specific security policies
# based on user intent, contributing to a strong Zero-Trust security posture.
# ----------------------------------------------------------------------------------------------------------------------

# Variables for the Dedicated Network Security Group
variable "security_group_name" {
  description = "The name of the security group to create."
  type        = string
}

variable "security_group_description" {
  description = "A concise description for the security group's purpose."
  type        = string
  default     = "AI-generated security group for network access control."
}

variable "security_group_vpc_id" {
  description = "The ID of the VPC to associate this security group with."
  type        = string
}

variable "security_group_ingress_rules" {
  description = "A list of ingress rules for the security group. Each object defines from_port, to_port, protocol, cidr_blocks, and an optional description."
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    security_groups = optional(list(string), []) # Allow referencing other security groups
    description = optional(string, "")
  }))
  default = [] # No ingress by default, enforces least privilege
}

variable "security_group_egress_rules" {
  description = "A list of egress rules for the security group. Each object defines from_port, to_port, protocol, cidr_blocks, and an optional description."
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = optional(string, "")
  }))
  default = [{ # Default to allowing all outbound traffic, common for initial deployments
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic by default"
  }]
}

variable "security_group_environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "security_group_project_name" {
  description = "The name of the project associated with this security group."
  type        = string
}

# Dedicated Network Security Group Resources
resource "aws_security_group" "dedicated_sg" {
  name        = var.security_group_name
  description = var.security_group_description
  vpc_id      = var.security_group_vpc_id

  dynamic "ingress" {
    for_each = var.security_group_ingress_rules
    content {
      from_port       = ingress.value.from_port
      to_port         = ingress.value.to_port
      protocol        = ingress.value.protocol
      cidr_blocks     = ingress.value.cidr_blocks
      security_groups = ingress.value.security_groups
      description     = ingress.value.description
    }
  }

  dynamic "egress" {
    for_each = var.security_group_egress_rules
    content {
      from_port   = egress.value.from_port
      to_port     = egress.value.to_port
      protocol    = egress.value.protocol
      cidr_blocks = egress.value.cidr_blocks
      description = egress.value.description
    }
  }

  tags = {
    Name        = var.security_group_name
    Environment = var.security_group_environment
    Project     = var.security_group_project_name
    ManagedBy   = "AI-IaC-CoPilot"
  }
}

# Dedicated Network Security Group Outputs
output "security_group_id" {
  description = "The ID of the dedicated security group."
  value       = aws_security_group.dedicated_sg.id
}

output "security_group_arn" {
  description = "The ARN of the dedicated security group."
  value       = aws_security_group.dedicated_sg.arn
}