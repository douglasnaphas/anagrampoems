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

# Get info needed for login testing
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACKNAME} | \
  jq '.Stacks[0].Outputs | map(select(.OutputKey == "UserPoolClientId"))[0].OutputValue' | \
  tr -d \")
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACKNAME} | \
  jq '.Stacks[0].Outputs | map(select(.OutputKey == "UserPoolId"))[0].OutputValue' | \
  tr -d \")
USER_POOL_DOMAIN=$(aws cognito-idp describe-user-pool \
  --user-pool-id ${USER_POOL_ID} | \
  jq '.UserPool.Domain' | \
  tr -d \")
REDIRECT_URI=${APP_URL}/backend/get-cookies
IDP_URL="https://${USER_POOL_DOMAIN}.auth.${AWS_DEFAULT_REGION}.amazoncognito.com/login?response_type=code&client_id=${USER_POOL_CLIENT_ID}&redirect_uri=${REDIRECT_URI}"

# determine the file to run, default to App.itest.cjs if not provided
FILE_TO_RUN=${1:-App.itest.cjs}

if [[ "${SLOW}" == "y" ]]
then
  SLOW_ARG="--slow"
else
  SLOW_ARG=
fi
node "$FILE_TO_RUN" \
  --site ${APP_URL} \
  --idp-url "${IDP_URL}" \
  --user-pool-id ${USER_POOL_ID} \
  ${SLOW_ARG}