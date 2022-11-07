import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

class Database extends Construct {
  public readonly documentsTable: dynamodb.ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const documentsTable = new dynamodb.Table(this, "DocumentsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    documentsTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      nonKeyAttributes: ["DateUploaded", "Processed", "Thumbnail", "Uploader", "FileSize", "Name", "Owner"],
      partitionKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      sortKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    this.documentsTable = documentsTable;
  }
}

export { Database };
