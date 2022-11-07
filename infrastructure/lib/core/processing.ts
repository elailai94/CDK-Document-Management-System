import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as stepfunctions from "aws-cdk-lib/aws-stepfunctions";
import * as stepfunctionsTasks from "aws-cdk-lib/aws-stepfunctions-tasks";

import { Construct } from "constructs";
import { NodejsServiceFunction } from "../constructs/lambda";

interface ProcessingProps {
  assetBucket: s3.IBucket;
  documentsTable: dynamodb.ITable;
  uploadBucket: s3.IBucket;
}

class Processing extends Construct {
  public readonly stateMachine: stepfunctions.IStateMachine;

  constructor(scope: Construct, id: string, props: ProcessingProps) {
    super(scope, id);

    // Metadata service
    const metadataService = new NodejsServiceFunction(this, "MetadataService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "processing", "metadata.js"),
      handler: "getDocumentMetadata",
      timeout: cdk.Duration.seconds(120),
    });

    metadataService.addEnvironment("ASSET_BUCKET", props.assetBucket.bucketName);
    metadataService.addEnvironment("UPLOAD_BUCKET", props.uploadBucket.bucketName);

    props.assetBucket.grantWrite(metadataService);
    props.uploadBucket.grantRead(metadataService);

    const getMetadataLambdaInvoke = new stepfunctionsTasks.LambdaInvoke(this, "Get Document Metadata", {
      lambdaFunction: metadataService,
      outputPath: "$.Payload",
    });

    // Thumbnail service
    const thumbnailService = new NodejsServiceFunction(this, "ThumbnailService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "processing", "thumbnail.js"),
      handler: "generateDocumentThumbnail",
      layers: [
        lambda.LayerVersion.fromLayerVersionAttributes(this, "GhostscriptLayerVersion", {
          compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
          layerVersionArn: "arn:aws:lambda:us-east-1:764866452798:layer:ghostscript:12",
        }),
      ],
      timeout: cdk.Duration.seconds(120),
    });

    thumbnailService.addEnvironment("ASSET_BUCKET", props.assetBucket.bucketName);
    thumbnailService.addEnvironment("UPLOAD_BUCKET", props.uploadBucket.bucketName);

    props.assetBucket.grantWrite(thumbnailService);
    props.uploadBucket.grantRead(thumbnailService);

    const generateThumbnailLambdaInvoke = new stepfunctionsTasks.LambdaInvoke(
      this,
      "Generate Document Thumbnail",
      {
        lambdaFunction: thumbnailService,
        outputPath: "$.Payload",
      },
    );

    // Detection service
    const detectionService = new NodejsServiceFunction(this, "DetectionService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "processing", "detection.js"),
      handler: "detectDocumentText",
    });

    detectionService.addEnvironment("UPLOAD_BUCKET", props.uploadBucket.bucketName);

    detectionService.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:StartDocumentTextDetection"],
        resources: ["*"],
      }),
    );

    props.uploadBucket.grantReadWrite(detectionService);

    const detectTextLambdaInvoke = new stepfunctionsTasks.LambdaInvoke(this, "Detect Document Text", {
      lambdaFunction: detectionService,
      outputPath: "$.Payload",
    });

    // Results service
    const resultsService = new NodejsServiceFunction(this, "ResultsService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "processing", "results.js"),
      handler: "getDetectionResults",
      timeout: cdk.Duration.seconds(300),
    });

    resultsService.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:GetDocumentTextDetection"],
        resources: ["*"],
      }),
    );

    const getResultsLambdaInvoke = new stepfunctionsTasks.LambdaInvoke(this, "Get Detection Results", {
      lambdaFunction: resultsService,
      outputPath: "$.Payload",
    });

    getResultsLambdaInvoke.addRetry({
      backoffRate: 2,
      interval: cdk.Duration.seconds(5),
      maxAttempts: 100,
    });
  }
}

export { Processing };
