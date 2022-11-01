import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { Database } from "./database";
import { Storage } from "./storage";
import { WebApp } from "./webapp";

class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const storage = new Storage(this, "Storage");

    new Database(this, "Database");

    new WebApp(this, "WebApp", {
      baseDirectory: "../",
      hostingBucket: storage.hostingBucket,
      relativeWebAppPath: "webapp",
    });
  }
}

export { ApplicationStack };
