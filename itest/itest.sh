#!/bin/bash
set -e
# check for necessary env vars
for required_env_var in \
  AWS_DEFAULT_REGION \
  AWS_REGION \
  GITHUB_REPOSITORY \
  GITHUB_REF ; do
  if [[ ! -n "${!required_env_var}" ]] ; then
    echo "env var ${required_env_var} must be set"
    exit 2
  fi
done
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix anagrampoems-web --hash 5)
APP_URL=https://$(aws cloudformation describe-stacks \
  --stack-name ${STACKNAME} | \
  jq '.Stacks[0].Outputs | map(select(.OutputKey == "webappDomainName"))[0].OutputValue' | \
  tr -d \")
echo "APP_URL:"
echo ${APP_URL}
if [[ "${SLOW}" == "y" ]]
then
  SLOW_ARG="--slow"
else
  SLOW_ARG=
fi
node App.itest.cjs \
  --site ${APP_URL} \
  ${SLOW_ARG}