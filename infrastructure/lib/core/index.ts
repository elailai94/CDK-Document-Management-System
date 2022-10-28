import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new cdk.CfnOutput(this, "TestOutput", {
      value: "Hey, it worked!"
    });
  }
}
