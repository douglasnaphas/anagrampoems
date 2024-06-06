import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import path = require("path");

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // backend
    const webFn = new lambda.Function(this, "WebFn", {
      code: lambda.Code.fromAsset("../backend"),
      handler: "lambda.handler",
      runtime: lambda.Runtime.NODEJS_20_X,
    });
    const api = new apigwv2.HttpApi(this, "API", {
      defaultIntegration: new HttpLambdaIntegration("WebIntegration", webFn),
    });
    const apiHostName =
      api.apiId + ".execute-api." + this.region + "." + this.urlSuffix;
    new cdk.CfnOutput(this, "APIHostname", {
      value: apiHostName,
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
  }
}
