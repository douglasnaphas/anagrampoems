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
