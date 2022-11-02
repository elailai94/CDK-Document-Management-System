import * as apigateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";

import { Construct } from "constructs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

interface APIProps {
  commentsService: lambda.IFunction;
}

class API extends Construct {
  public readonly httpAPI: apigateway.HttpApi;

  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id);

    const serviceMethods = [
      apigateway.HttpMethod.GET,
      apigateway.HttpMethod.POST,
      apigateway.HttpMethod.DELETE,
      apigateway.HttpMethod.PUT,
      apigateway.HttpMethod.PATCH,
    ];

    this.httpAPI = new apigateway.HttpApi(this, "HttpAPI", {
      apiName: "http-api",
      corsPreflight: {
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type", "*"],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.DELETE,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.PATCH,
        ],
        allowOrigins: ["http://localhost:3000", "https://*"],
        maxAge: cdk.Duration.days(10),
      },
      createDefaultStage: true,
    });

    // Comments service
    const lambdaIntegration = new HttpLambdaIntegration("HttpLambdaIntegration", props.commentsService);

    this.httpAPI.addRoutes({
      integration: lambdaIntegration,
      methods: serviceMethods,
      path: "/comments/{proxy+}",
    });

    // Moderation service
    const queue = new sqs.Queue(this, "ModerationQueue");

    const moderateRole = new iam.Role(this, "ModerationRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    moderateRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["sqs:SendMessage"],
        resources: [queue.queueArn],
      }),
    );

    const sqsIntegration = new apigatewayv2.CfnIntegration(this, "ModerateIntegration", {
      apiId: this.httpAPI.apiId,
      credentialsArn: moderateRole.roleArn,
      integrationSubtype: "SQS-SendMessage",
      integrationType: "AWS_PROXY",
      payloadFormatVersion: "1.0",
      requestParameters: {
        MessageBody: "$request.body",
        QueueUrl: queue.queueUrl,
      },
      timeoutInMillis: 10000,
    });

    new apigatewayv2.CfnRoute(this, "ModerateRoute", {
      apiId: this.httpAPI.apiId,
      routeKey: "POST /moderate",
      target: `integrations/${sqsIntegration.ref}`,
    });

    new cdk.CfnOutput(this, "APIEndpoint", {
      value: this.httpAPI.url!,
    });
  }
}

export { API };
