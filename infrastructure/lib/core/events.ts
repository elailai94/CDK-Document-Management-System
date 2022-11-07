import * as eventsTargets from "aws-cdk-lib/aws-events-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as stepfunctions from "aws-cdk-lib/aws-stepfunctions";

import { Construct } from "constructs";

interface EventsProps {
  processingStateMachine: stepfunctions.IStateMachine;
  uploadBucket: s3.IBucket;
}

class Events extends Construct {
  constructor(scope: Construct, id: string, props: EventsProps) {
    super(scope, id);

    const uploadRule = props.uploadBucket.onCloudTrailWriteObject("UploadRule");
    const stateMachineTarget = new eventsTargets.SfnStateMachine(props.processingStateMachine);

    uploadRule.addTarget(stateMachineTarget);
  }
}

export { Events };
