import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

class Auth extends Construct {
  public readonly userPool: cognito.IUserPool;
  public readonly userPoolClient: cognito.IUserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "UserPool", {
      autoVerify: { email: true },
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      standardAttributes: {
        fullname: {
          mutable: true,
          required: true,
        },
        phoneNumber: {
          mutable: true,
          required: false,
        },
        profilePicture: {
          mutable: true,
          required: false,
        },
      },
    });

    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      userPool: this.userPool,
    });

    // Groups
    new cognito.CfnUserPoolGroup(this, "AdminGroup", {
      description: "Admin users",
      groupName: "admin",
      precedence: 1,
      userPoolId: this.userPool.userPoolId,
    });

    new cognito.CfnUserPoolGroup(this, "ContributorGroup", {
      description: "Users who can manage documents but not users",
      groupName: "contributor",
      precedence: 5,
      userPoolId: this.userPool.userPoolId,
    });

    new cognito.CfnUserPoolGroup(this, "ReaderGroup", {
      description: "Users who can only read and comment",
      groupName: "reader",
      precedence: 10,
      userPoolId: this.userPool.userPoolId,
    });
  }
}

export { Auth };
