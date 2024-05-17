import { App } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { GitHubOidcRoleStack } from "aws-github-oidc-role";
export const GitHubOidcRoleStacks = (app: App, repository: string) => {
  const policyStatements = [
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "cloudformation:CreateChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStacks",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:GetTemplate",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:PutParameter",
      ],
      resources: ["*"],
    }),
  ];
  const CHARACTERS_PROHIBITED_IN_CLOUDFORMATION_STACK_NAMES = /[^a-zA-Z0-9-]/g;
  const stacknamePrefix = `github-role-${repository.replaceAll(
    CHARACTERS_PROHIBITED_IN_CLOUDFORMATION_STACK_NAMES,
    "-"
  )}`;
  const PROD_ENV_SUFFIX = "prod-env";
  const TEST_ENV_SUFFIX = "test-env";
  const DEV_ENV_SUFFIX = "dev-env";
  new GitHubOidcRoleStack(app, stacknamePrefix + `-${PROD_ENV_SUFFIX}`, {
    gitHubEnvironment: "prod",
    repository,
    managedPolicyList: [],
    policyStatements,
    roleName:
      `github-actions` +
      `@${repository.split("/").slice(-1)}` +
      `@${PROD_ENV_SUFFIX}`,
  });
  new GitHubOidcRoleStack(app, stacknamePrefix + `-${TEST_ENV_SUFFIX}`, {
    gitHubEnvironment: "test",
    repository,
    managedPolicyList: [],
    policyStatements,
    roleName:
      `github-actions` +
      `@${repository.split("/").slice(-1)}` +
      `@${TEST_ENV_SUFFIX}`,
  });
  new GitHubOidcRoleStack(app, stacknamePrefix + `-${DEV_ENV_SUFFIX}`, {
    gitHubEnvironment: "test",
    repository,
    managedPolicyList: [],
    policyStatements,
    roleName:
      `github-actions` +
      `@${repository.split("/").slice(-1)}` +
      `@${DEV_ENV_SUFFIX}`,
  });
  new GitHubOidcRoleStack(app, stacknamePrefix + `-master`, {
    ref: "refs/heads/master",
    repository,
    managedPolicyList: [],
    policyStatements,
    roleName:
      `github-actions` + `@${repository.split("/").slice(-1)}` + `@master`,
  });
  new GitHubOidcRoleStack(app, stacknamePrefix + `-all-branches`, {
    ref: "*",
    repository,
    managedPolicyList: [],
    policyStatements,
    roleName: `github-actions` + `@${repository.split("/").slice(-1)}`,
  });
};
