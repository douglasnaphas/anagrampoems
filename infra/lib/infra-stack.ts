import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path = require("path");

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const webFn = new lambda.Function(this, "WebFn", {
      code: lambda.Code.fromAsset("../web/dist"),
      handler: "lambda.handler",
      runtime: lambda.Runtime.NODEJS_20_X,
    });
    const defaultApiIntegration = new HttpLambdaIntegration(
      "WebIntegration",
      webFn
    );
    const api = new apigwv2.HttpApi(this, "API");
    api.addRoutes({
      path: "/",
      methods: [apigwv2.HttpMethod.ANY],
      integration: defaultApiIntegration,
    });
  }
}
