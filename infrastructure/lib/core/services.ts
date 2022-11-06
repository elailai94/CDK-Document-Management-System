import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";

import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsServiceFunction } from "../constructs/lambda";

interface ServicesProps {
  assetBucket: s3.IBucket;
  documentsTable: dynamodb.ITable;
  uploadBucket: s3.IBucket;
}

class Services extends Construct {
  public readonly commentsService: NodejsFunction;
  public readonly documentsService: NodejsFunction;

  constructor(scope: Construct, id: string, props: ServicesProps) {
    super(scope, id);

    // Comments service

    this.commentsService = new NodejsServiceFunction(this, "CommentsService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "comments", "index.js"),
      handler: "handleComments"
    });

    this.commentsService.addEnvironment("DYNAMO_DB_TABLE", props.documentsTable.tableName);

    props.documentsTable.grantReadWriteData(this.commentsService);

    // Documents service

    this.documentsService = new NodejsServiceFunction(this, "DocumentsService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "documents", "index.js"),
      handler: "handleDocuments",
      timeout: cdk.Duration.seconds(10),
    });

    this.documentsService.addEnvironment("ASSET_BUCKET", props.assetBucket.bucketName);
    this.documentsService.addEnvironment("DYNAMO_DB_TABLE", props.documentsTable.tableName);
    this.documentsService.addEnvironment("UPLOAD_BUCKET", props.uploadBucket.bucketName);

    props.documentsTable.grantReadWriteData(this.documentsService);
    props.assetBucket.grantRead(this.documentsService);
    props.uploadBucket.grantWrite(this.documentsService);
  }
}

export { Services};
