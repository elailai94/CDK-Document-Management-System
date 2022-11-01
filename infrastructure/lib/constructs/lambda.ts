import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

type NodejsServiceFunctionProps = NodejsFunctionProps;

class NodejsServiceFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsServiceFunctionProps) {
    const architecture = props.architecture ?? lambda.Architecture.ARM_64;
    const bundling = {
      externalModules: ["aws-sdk"],
    };
    const handler = props.handler ?? "handler";
    const runtime = props.runtime ?? lambda.Runtime.NODEJS_16_X;

    super(scope, id, {
      ...props,
      architecture,
      bundling,
      handler,
      runtime,
    });
  }
}

export { NodejsServiceFunction };
