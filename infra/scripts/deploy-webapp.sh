#!/bin/bash

set -e
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix anagrampoems-web --hash 5);
AWS_REGION=us-east-1 CDK_DEFAULT_REGION=us-east-1 npx cdk --region=us-east-1 deploy --require-approval never ${STACKNAME};
