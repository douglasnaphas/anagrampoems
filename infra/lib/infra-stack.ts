import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
import { aws_cloudfront_origins as origins } from "aws-cdk-lib";
import { aws_cognito as cognito } from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import path = require("path");
const crypto = require("crypto");
const stackname = require("@cdk-turnkey/stackname");

export interface InfraStackProps extends cdk.StackProps {
  fromAddress?: string;
  domainName?: string;
  zoneId?: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: InfraStackProps) {
    super(scope, id, props);

    // frontend
    const frontendBucket = new s3.Bucket(this, "FrontendBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const deployedFrontend = new s3deploy.BucketDeployment(
      this,
      "DeployedFrontend",
      {
        sources: [s3deploy.Source.asset("../frontend/dist")],
        destinationBucket: frontendBucket,
      }
    );

    // distro, for frontend and backend
    const distroProps: any = {
      enableLogging: true,
      logFilePrefix: "distribution-access-logs/",
      logIncludesCookies: true,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: "index.html",
    };
    const distro = new cloudfront.Distribution(this, "Distro", distroProps);

    const webappDomainName = props?.domainName || distro.distributionDomainName;

    // Cognito user pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Anagram Poems: verify your new account",
        emailStyle: cognito.VerificationEmailStyle.LINK,
      },
      signInAliases: {
        username: true,
        email: true,
        phone: false,
        preferredUsername: false,
      },
      autoVerify: { email: true, phone: false },
      mfa: cognito.Mfa.OPTIONAL,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
        minLength: 8,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
    });
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    // Cognito user pool domain
    const domainPrefixLength = 12;
    const domainPrefix = crypto
      .createHash("sha256")
      .update(stackname(`domain-prefix`, { hash: 5 }) /*+ `${this.account}`*/)
      .digest("hex")
      .toLowerCase()
      .slice(0, domainPrefixLength);
    const userPoolDomain = userPool.addDomain("UserPoolDomain", {
      cognitoDomain: { domainPrefix },
    });

    // Cognito app client
    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      generateSecret: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.COGNITO_ADMIN,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: ["https://" + webappDomainName + "/backend/get-cookies"],
        logoutUrls: ["https://" + webappDomainName + "/backend/logout"],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });

    // Output the User Pool Domain URL
    // new cdk.CfnOutput(this, "CognitoDomainUrl", {
    //   value: `https://${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
    // });

    // persistence
    // DynamoDB table
    const schema = require("../../backend/schema.js");
    const table = new dynamodb.Table(this, "Table", {
      partitionKey: {
        name: schema.PARTITION_KEY,
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: schema.SORT_KEY, type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // backend
    const webFn = new lambda.Function(this, "WebFn", {
      code: lambda.Code.fromAsset("../backend"),
      handler: "lambda.handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 3000,
      environment: {
        TABLE_NAME: table.tableName,
        IDP_URL:
          "https://" +
          userPoolDomain.domainName +
          ".auth." +
          this.region +
          ".amazoncognito.com/login?response_type=code&client_id=" +
          userPoolClient.userPoolClientId +
          "&redirect_uri=" +
          "https://" +
          webappDomainName +
          "/backend/get-cookies",
        JWKS_URL:
          "https://cognito-idp." +
          this.region +
          ".amazonaws.com/" +
          userPool.userPoolId +
          "/.well-known/jwks.json",
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_DOMAIN: userPoolDomain.domainName,
        REDIRECT_URI: "https://" + webappDomainName + "/backend/get-cookies",
        REGION: this.region,
      },
    });
    const api = new apigwv2.HttpApi(this, "API", {
      defaultIntegration: new HttpLambdaIntegration("WebIntegration", webFn),
    });
    const apiUrl = (api: apigwv2.HttpApi) =>
      api.apiId + ".execute-api." + this.region + "." + this.urlSuffix;
    new cdk.CfnOutput(this, "APIHostname", {
      value: apiUrl(api),
    });

    // Let the backend handler read from and write to the DynamoDB table
    table.grantReadWriteData(webFn);
    // Let the backend handler describe the user pool client
    webFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["cognito-idp:DescribeUserPoolClient"],
        resources: [
          `arn:aws:cognito-idp:${userPool.stack.region}:${userPool.stack.account}:userpool/${userPool.userPoolId}`,
        ],
      })
    );

    distro.addBehavior("/backend/*", new origins.HttpOrigin(apiUrl(api)), {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: new cloudfront.OriginRequestPolicy(
        this,
        "BackendORP",
        {
          cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
          queryStringBehavior:
            cloudfront.OriginRequestQueryStringBehavior.all(),
        }
      ),
    });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distro.distributionDomainName,
    });
    new cdk.CfnOutput(this, "webappDomainName", {
      value: distro.distributionDomainName,
    });
  }
}
