import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";

import { Construct } from "constructs";

interface WebAppProps {
  hostingBucket: s3.IBucket;
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
  }
}

export { WebApp };
