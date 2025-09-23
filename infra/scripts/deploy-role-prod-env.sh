#!/bin/bash

set -e
[[ ! -z ${GITHUB_REPOSITORY} ]]
STACKNAME=github-role-$(echo ${GITHUB_REPOSITORY} | sed 's/[^a-zA-Z0-9-]/-/g')-prod-env;
AWS_REGION=us-east-1 CDK_DEFAULT_REGION=us-east-1 npx cdk --region=us-east-1 deploy ${STACKNAME};
