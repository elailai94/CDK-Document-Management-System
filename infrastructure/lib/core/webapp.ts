import * as apigateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as webAppTools from "cdk-webapp-tools";

import { Construct } from "constructs";

interface WebAppProps {
  baseDirectory: string;
  hostingBucket: s3.IBucket;
  httpAPI: apigateway.HttpApi;
  relativeWebAppPath: string;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
}

class WebApp extends Construct {
  public readonly webDistribution: cloudfront.CloudFrontWebDistribution;

  constructor(scope: Construct, id: string, props: WebAppProps) {
    super(scope, id);

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity");

    const cloudfrontProps: cloudfront.CloudFrontWebDistributionProps = {
      errorConfigurations: [
        {
          errorCachingMinTtl: 86400,
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
        {
          errorCachingMinTtl: 86400,
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
      ],
      originConfigs: [
        {
          behaviors: [{ isDefaultBehavior: true }],
          s3OriginSource: {
            originAccessIdentity,
            s3BucketSource: props.hostingBucket,
          },
        },
      ],
    };
    this.webDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "CloudFrontWebDistribution",
      cloudfrontProps,
    );

    props.hostingBucket.grantRead(originAccessIdentity);

    const deployment = new webAppTools.WebAppDeployment(this, "WebAppDeployment", {
      baseDirectory: props.baseDirectory,
      bucket: props.hostingBucket,
      buildCommand: "yarn build",
      buildDirectory: "build",
      prune: false,
      relativeWebAppPath: props.relativeWebAppPath,
      webDistribution: this.webDistribution,
      webDistributionPaths: ["/*"],
    });

    new webAppTools.WebAppConfig(this, "WebAppConfig", {
      bucket: props.hostingBucket,
      configData: {
        apiEndpoint: props.httpAPI.apiEndpoint,
        userPoolId: props.userPool.userPoolId,
        userPoolWebClientId: props.userPoolClient.userPoolClientId,
      },
      globalVariableName: "appConfig",
      key: "config.js",
    }).node.addDependency(deployment);

    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: `https://${this.webDistribution.distributionDomainName}`,
    });
  }
}

export { WebApp };
