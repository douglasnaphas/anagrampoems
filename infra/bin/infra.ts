#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
const stackname = require("@cdk-turnkey/stackname");
import { GitHubOidcRoleStacks } from "./GitHubOIDCRoleStacks";
import { InfraStack } from "../lib/infra-stack";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { HostedZone } from "aws-cdk-lib/aws-route53";

// Step 1: Certificate Stack in us-east-1
class CertificateStack extends Stack {
  public readonly certificateArnV3: string;
  constructor(scope: Construct, id: string, props: StackProps & { domainName: string; hostedZoneId: string }) {
    super(scope, id, { ...props, env: { region: "us-east-1" } });
    const wwwDomainName = "www." + props.domainName;

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    const cert = new Certificate(this, "Certificate", {
      domainName: props.domainName,
      validation: CertificateValidation.fromDns(hostedZone),
      subjectAlternativeNames: [wwwDomainName],
    });
    this.certificateArnV3 = cert.certificateArn;
  }
}

(async () => {
  if (!process.env.GITHUB_REPOSITORY) {
    console.error("GITHUB_REPOSITORY is not set, it should be something like douglasnaphas/aws-github-oidc");
    process.exit(3);
  }
  if (!process.env.GITHUB_REF) {
    console.error("GITHUB_REPOSITORY is not set, it should be something like refs/heads/main");
    process.exit(4);
  }

  const app = new cdk.App();
  GitHubOidcRoleStacks(app, process.env.GITHUB_REPOSITORY);

  let certificateArn: string | undefined;

  if (process.env.DOMAIN_NAME && process.env.ZONE_ID) {
    // Create the cert stack in us-east-1
    const certStack = new CertificateStack(app, stackname("anagrampoems-cert", { hash: 5 }), {
      domainName: process.env.DOMAIN_NAME,
      hostedZoneId: process.env.ZONE_ID,
      env: { region: "us-east-1" },
      crossRegionReferences: true,
    });
    certificateArn = certStack.certificateArnV3;
  }

  // Step 2: Create InfraStack in your target region, referencing the cert ARN if available
  new InfraStack(
    app,
    stackname("anagrampoems-web", { hash: 5 }),
    {
      zoneId: process.env.ZONE_ID,
      domainName: process.env.DOMAIN_NAME,
      certificateArn, // <-- only defined if DOMAIN_NAME is set
      env: { region: process.env.CDK_DEFAULT_REGION || "us-east-2" },
      crossRegionReferences: true,
    }
  );
})();
