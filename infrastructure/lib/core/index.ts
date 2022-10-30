import * as cdk from "aws-cdk-lib";

import { AssetStorage } from "./storage";
import { Construct } from "constructs";

class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AssetStorage(this, "AssetStorage");
  }
}

export { ApplicationStack };
