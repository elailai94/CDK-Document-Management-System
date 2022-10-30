import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

import { Construct } from "constructs";

class AssetStorage extends Construct {
  public readonly assetBucket: s3.IBucket;
  public readonly hostingBucket: s3.IBucket;
  public readonly uploadBucket: s3.IBucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.assetBucket = new s3.Bucket(this, "AssetBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.hostingBucket = new s3.Bucket(this, "HostingBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.uploadBucket = new s3.Bucket(this, "UploadBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}

export { AssetStorage };
