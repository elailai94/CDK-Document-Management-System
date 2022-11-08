/* eslint-disable no-console */

import * as path from "path";

import { awsClients } from "../common";

// Setup S3 client
const s3 = awsClients.s3();

// Get the EventBridge client
const eventbridge = awsClients.eventbridge();

// Utilize the DynamoDB document client
const dynamoDB = awsClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_TABLE;

// Lambda handler
async function handleError(event) {
  // First function failing
  const filename =
    Object.prototype.hasOwnProperty.call(event, "detail") && event.detail.requestParameters.key
      ? event.detail.requestParameters.key
      : event.file.key;

  if (!filename || filename.length < 5) {
    throw new Error("Could not determine filename from input data");
  }

  const key = path.basename(filename, ".pdf");

  // Get owner from DynamoDB
  const getOwnerParams = {
    ExpressionAttributeValues: {
      ":key": key,
      ":prefix": "Doc",
    },
    KeyConditionExpression: "PK = :key AND begins_with(SK, :prefix)",
    TableName: tableName,
  };
  const results = await dynamoDB.query(getOwnerParams).promise();
  const owner = results.Items[0].Owner;
  const originalFileName = results.Items[0].FileDetails.fileName;

  // Try to delete from DynamoDB
  const deleteParams = {
    Key: {
      PK: key,
      SK: "Doc#Marketing",
    },
    TableName: tableName,
  };

  try {
    await dynamoDB.delete(deleteParams).promise();
  } catch (error) {
    console.error(`Could not delete data from database ${error}`);
  }

  // Try to delete from S3 (both buckets)
  try {
    await s3.deleteObject({ Bucket: process.env.ASSET_BUCKET, Key: filename }).promise();
    await s3.deleteObject({ Bucket: process.env.UPLOAD_BUCKET, Key: filename }).promise();
  } catch (error) {
    console.info("Cannot delete file from one or more buckets. This may not be an error.");
  }

  // Try to delete thumbnail
  try {
    await s3.deleteObject({ Bucket: process.env.ASSET_BUCKET, Key: `${key}-thumb.png` }).promise();
  } catch (error) {
    console.info(
      "Cannot delete thumbnail. This may not be an error, as the thumbnail may not have been created yet.",
    );
  }

  // Send EventBridge event
  const detail = {
    filename: originalFileName,
    key,
    owner,
  };
  const eventParams = {
    Entries: [
      {
        Detail: JSON.stringify(detail),
        DetailType: "ProcessingFailed",
        EventBusName: "com.globomantics.dms",
        Resources: [],
        Source: "com.globomantics.dms.processing",
      },
    ],
  };

  await eventbridge.putEvents(eventParams).promise();
}

export { handleError };
