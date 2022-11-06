/**
 * Documents Service
 *
 * This is a microservice that handles all interactions for documents
 * in the document management system application.
 */

import * as path from "path";
import * as url from "url";

import {
  Matcher,
  RouterType,
  createRouter,
  parseMultipartFormData,
  validateMultipartFormData,
  validatePathVariables,
} from "lambda-micro";
import { awsClients, generateID } from "../common";

// Setup S3 client
const s3 = awsClients.s3();

// Utilize the DynamoDB document client
const dynamoDB = awsClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_NAME;

// JSON schemas used to validate requests to the service calls
const schemas = {
  createDocument: require("./schemas/createDocument.json"),
  idPathVariable: require("./schemas/idPathVariable.json"),
};

// Utility functions

/**
 * This function is used to generate bulk writes for DynamoDB (this
 * is used when deleting all items with the same PK)
 */
function generateDeleteRequestsForItems(items) {
  return items.map(item => ({
    DeleteRequest: {
      Key: {
        PK: item.PK,
        SK: item.SK,
      },
    },
  }));
}

async function uploadFileToS3(id, formFile) {
  const params = {
    Body: formFile.content,
    Bucket: process.env.UPLOAD_BUCKET,
    ContentType: formFile.contentType,
    Key: `${id}.pdf`,
  };

  return s3.upload(params).promise();
}

async function createSignedS3URL(unsignedURL) {
  const parsedURL = url.parse(unsignedURL);
  const filename = path.basename(parsedURL.pathname);
  const urlExpirySeconds = 60 * 5;
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Expires: urlExpirySeconds,
    Key: filename,
  };
  const signedURL = await s3.getSignedUrlPromise("getObject", params);

  return signedURL;
}

// Service functions

// Get all documents
async function getAllDocuments(request, response) {
  const params = {
    ExpressionAttributeValues: {
      ":key": "Doc#Marketing",
    },
    IndexName: "GSI1",
    KeyConditionExpression: "SK = :key",
    TableName: tableName,
  };
  const results = await dynamoDB.query(params).promise();

  return response.output(results.Items, 200);
}

// Gets a single document based on the path variable
async function getDocument(request, response) {
  const params = {
    ExpressionAttributeValues: {
      ":key": request.pathVariables.id,
      ":prefix": "Doc",
    },
    KeyConditionExpression: "PK = :key AND begins_with(SK, :prefix)",
    TableName: tableName,
  };
  const results = await dynamoDB.query(params).promise();
  const [document] = results.Items;
  document.Thumbnail = await createSignedS3URL(document.Thumbnail);
  document.Document = await createSignedS3URL(document.Document);

  return response.output(document, 200);
}

/**
 * Deletes a document (which also deletes anything attaches to it, like
 * a comment)
 */
async function deleteDocument(request, response) {
  const params = {
    ExpressionAttributeValues: {
      ":key": request.pathVariables.id,
    },
    KeyConditionExpression: "PK = :key",
    TableName: tableName,
  };
  const allValues = await dynamoDB.query(params).promise();
  const batchParams = {
    RequestItems: {
      [tableName]: generateDeleteRequestsForItems(allValues.Items),
    },
  };

  await dynamoDB.batchWrite(batchParams).promise();

  return response.output({}, 200);
}

// Creates a new document
async function createDocument(request, response) {
  const fileID = generateID();
  const [file] = request.formData.files;

  // Upload file to S3
  await uploadFileToS3(fileID, file);

  // Add to database
  const { fields } = request.formData;
  const item = {
    DateUploaded: new Date().toISOString(),
    FileDetails: {
      contentType: file.contentType,
      encoding: file.encoding,
      fileName: file.fileName,
    },
    Name: fields.name,
    Owner: "fc4cec10-6ae4-435c-98ca-6964382fee77", // Hard-coded until we put users in place
    PK: fileID,
    SK: "Doc#Marketing",
  };

  // Add tags (if present)
  if (fields.tags && fields.tags.length > 0) {
    item.Tags = fields.tags.split(",");
  }

  // Insert into database
  const params = {
    Item: item,
    ReturnValues: "NONE",
    TableName: tableName,
  };

  await dynamoDB.put(params).promise();

  return response.output("Document created", 200);
}

// Lambda router
const router = createRouter(RouterType.HTTP_API_V2);

router.add(Matcher.HttpApiV2("GET", "/documents/"), getAllDocuments);

router.add(
  Matcher.HttpApiV2("GET", "/documents(/:id)"),
  validatePathVariables(schemas.idPathVariable),
  getDocument,
);

router.add(
  Matcher.HttpApiV2("DELETE", "/documents(/:id)"),
  validatePathVariables(schemas.idPathVariable),
  deleteDocument,
);

router.add(
  Matcher.HttpApiV2("POST", "/documents/"),
  parseMultipartFormData,
  validateMultipartFormData(schemas.createDocument),
  createDocument,
);

// Lambda handler
function handleDocuments(event, context) {
  return router.run(event, context);
}

export { handleDocuments };
