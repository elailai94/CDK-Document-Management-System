import * as apigateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";

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

    const integration = new HttpLambdaIntegration("HttpLambdaIntegration", props.commentsService);

    this.httpAPI.addRoutes({
      integration,
      methods: serviceMethods,
      path: "/comments/{proxy+}",
    });

    new cdk.CfnOutput(this, "APIEndpoint", {
      value: this.httpAPI.url!,
    });
  }
}

export { API };
