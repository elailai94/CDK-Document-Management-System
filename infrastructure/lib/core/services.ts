import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";

import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsServiceFunction } from "../constructs/lambda";

interface ServicesProps {
  documentsTable: dynamodb.ITable;
}

class Services extends Construct {
  public readonly commentsService: NodejsFunction;

  constructor(scope: Construct, id: string, props: ServicesProps) {
    super(scope, id);

    this.commentsService = new NodejsServiceFunction(this, "CommentsService", {
      entry: path.join(__dirname, "..", "..", "..", "services", "comments", "index.js"),
      handler: "handleComments"
    });

    this.commentsService.addEnvironment("DYNAMO_DB_TABLE", props.documentsTable.tableName);

    props.documentsTable.grantReadWriteData(this.commentsService);
  }
}

export { Services};
