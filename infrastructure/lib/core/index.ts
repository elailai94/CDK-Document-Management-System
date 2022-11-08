import * as cdk from "aws-cdk-lib";

import { API } from "./api";
import { Auth } from "./auth";
import { Construct } from "constructs";
import { Database } from "./database";
import { Events } from "./events";
import { Processing } from "./processing";
import { Services } from "./services";
import { Storage } from "./storage";
import { WebApp } from "./webapp";

class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new Database(this, "Database");

    const storage = new Storage(this, "Storage");

    const services = new Services(this, "Services", {
      assetBucket: storage.assetBucket,
      documentsTable: database.documentsTable,
      uploadBucket: storage.uploadBucket,
    });

    const api = new API(this, "API", {
      commentsService: services.commentsService,
      documentsService: services.documentsService,
    });

    const processing = new Processing(this, "Processing", {
      assetBucket: storage.assetBucket,
      documentsTable: database.documentsTable,
      uploadBucket: storage.uploadBucket,
    });

    new Auth(this, "Auth");

    new Events(this, "Events", {
      notificationsService: services.notificationsService,
      processingStateMachine: processing.stateMachine,
      uploadBucket: storage.uploadBucket,
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
