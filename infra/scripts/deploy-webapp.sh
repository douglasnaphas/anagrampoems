#!/bin/bash

set -e
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix anagrampoems-web --hash 5);
npx cdk deploy --require-approval never ${STACKNAME};
