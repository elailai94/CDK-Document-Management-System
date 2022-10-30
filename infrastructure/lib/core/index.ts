import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { Storage } from "./storage";
import { WebApp } from "./webapp";

class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const storage = new Storage(this, "Storage");

    new WebApp(this, "WebApp", {
      hostingBucket: storage.hostingBucket,
    });
  }
}

export { ApplicationStack };
