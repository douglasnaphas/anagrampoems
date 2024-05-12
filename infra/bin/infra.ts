#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
const stackname = require("@cdk-turnkey/stackname");
import { GitHubOidcRoleStacks } from "./GitHubOIDCRoleStacks";
import { InfraStack } from "../lib/infra-stack";

(async () => {
  if (!process.env.GITHUB_REPOSITORY) {
    console.error(
      "GITHUB_REPOSITORY is not set, it should be something like douglasnaphas/aws-github-oidc"
    );
    process.exit(3);
  }
  if (!process.env.GITHUB_REF) {
    console.error(
      "GITHUB_REPOSITORY is not set, it should be something like refs/heads/main"
    );
    process.exit(4);
  }
  const app = new cdk.App();
  GitHubOidcRoleStacks(app, process.env.GITHUB_REPOSITORY);
  new InfraStack(app, stackname("anagrampoems-webapp"), {});
})();
