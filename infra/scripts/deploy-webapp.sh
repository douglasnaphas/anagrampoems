#!/bin/bash

set -e
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix webapp);
npx cdk deploy --require-approval never ${STACKNAME};
