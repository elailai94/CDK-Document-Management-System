import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { API } from "./api";
import { Database } from "./database";
import { Services } from "./services";
import { Storage } from "./storage";
import { WebApp } from "./webapp";

class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new Database(this, "Database");

    const storage = new Storage(this, "Storage");

    const services = new Services(this, "Services", {
      documentsTable: database.documentsTable,
    });

    const api = new API(this, "API", {
      commentsService: services.commentsService,
    });

    new WebApp(this, "WebApp", {
      baseDirectory: "../",
      hostingBucket: storage.hostingBucket,
      httpAPI: api.httpAPI,
      relativeWebAppPath: "webapp",
    });
  }
}

export { ApplicationStack };
