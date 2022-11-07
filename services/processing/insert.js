import * as path from "path";

import { awsClients, generateUpdateExpressions } from "../common";

// Setup S3 client
const s3 = awsClients.s3();

// Utilize the DynamoDB document client
const dynamoDB = awsClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_TABLE;

function getDocumentURL(event) {
  const region = process.env.AWS_REGION;
  const bucket = process.env.ASSET_BUCKET;

  return `https://s3.${region}.amazonaws.com/${bucket}/${event.file.key}`;
}

function getThumbnailURL(event) {
  const region = process.env.AWS_REGION;
  const { bucket } = event.thumbnail;

  return `https://s3.${region}.amazonaws.com/${bucket}/${event.thumbnail.key}`;
}

// Lambda handler
async function insertIntoTable(event) {
  const combinedEvent = {
    ...event[0],
    ...event[1],
  };

  // Delete file from upload bucket
  const deleteObjectParams = {
    Bucket: combinedEvent.file.bucket,
    Key: combinedEvent.file.key,
  };

  await s3.deleteObject(deleteObjectParams).promise();

  // Update DynamoDB with values
  const item = {
    DateProcessed: new Date().toISOString(),
    DateUploaded: new Date().toISOString(),
    DetectedText: combinedEvent.textDetection.textOutput,
    Document: getDocumentURL(combinedEvent),
    FileSize: combinedEvent.file.size,
    Metadata: combinedEvent.metadata,
    Thumbnail: getThumbnailURL(combinedEvent),
  };
  const { expressionAttributeValues: ExpressionAttributeValues, updateExpression: UpdateExpression } =
    generateUpdateExpressions(item);
  const updateParams = {
    ExpressionAttributeValues,
    Key: {
      PK: path.basename(combinedEvent.file.key, ".pdf"),
      SK: "Doc#Marketing",
    },
    ReturnValues: "ALL_NEW",
    TableName: tableName,
    UpdateExpression,
  };

  await dynamoDB.update(updateParams).promise();
}

export { insertIntoTable };
