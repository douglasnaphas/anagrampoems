#!/bin/bash

set -e
[[ ! -z ${GITHUB_REPOSITORY} ]]
STACKNAME=github-role-$(echo ${GITHUB_REPOSITORY} | sed 's/[^a-zA-Z0-9-]/-/g')-test-env;
npx cdk --region=us-east-2 deploy ${STACKNAME};
