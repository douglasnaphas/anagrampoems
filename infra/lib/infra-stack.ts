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
import path = require("path");

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // backend
    const webFn = new lambda.Function(this, "WebFn", {
      code: lambda.Code.fromAsset("../backend"),
      handler: "lambda.handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
    });
    const api = new apigwv2.HttpApi(this, "API", {
      defaultIntegration: new HttpLambdaIntegration("WebIntegration", webFn),
    });
    const apiUrl = (api: apigwv2.HttpApi) =>
      api.apiId + ".execute-api." + this.region + "." + this.urlSuffix;
    new cdk.CfnOutput(this, "APIHostname", {
      value: apiUrl(api),
    });

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
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: "index.html",
    };
    const distro = new cloudfront.Distribution(this, "Distro", distroProps);
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
