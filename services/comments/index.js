/**
 * Comments Service
 *
 * This Lambda function handles all interactions for comments in the document
 * management system application (create, delete, get).
 */

import { Matcher, RouterType, createRouter } from "lambda-micro";
import { awsClients, generateID } from "../common";

// Utilize the DynamoDB document client
const dynamoDB = awsClients.dynamoDB();
const tableName = process.env.DYNAMO_DB_NAME;

// Service functions
async function getAllCommentsForDocument(request, response) {
  const params = {
    ExpressionAttributeValues: {
      ":pk": request.pathVariables.docid,
      ":sk": "Comment",
    },
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    TableName: tableName,
  };

  const results = await dynamoDB.query(params).promise();

  return response.output(results.Items, 200);
}

async function createComment(request, response) {
  const userID = "fc4cec10-6ae4-435c-98ca-6964382fee77"; // Hard-coded until we put users in place
  const commentID = `Comment#${generateID()}`;
  const item = {
    DateAdded: new Date().toISOString(),
    Owner: userID,
    PK: request.pathVariables.docid,
    SK: commentID,
    ...JSON.parse(request.event.body),
  };
  const params = {
    Item: item,
    ReturnValues: "NONE",
    TableName: tableName,
  };

  await dynamoDB.put(params).promise();

  return response.output(item, 200);
}

async function deleteComment(request, response) {
  const params = {
    Key: {
      PK: request.pathVariables.docid,
      SK: `Comment#${request.pathVariables.commentid}`,
    },
    TableName: tableName,
  };

  await dynamoDB.delete(params).promise();

  return response.output({}, 200);
}

/**
 * Lambda router
 *
 * This uses a custom Lambda container that David have created that is very
 * similar to what he use for his projects in production (with the only
 * exception being that is is JavaScript and not TypeScript). David has
 * released this as an npm package, lambda-micro, and you can view it
 * at the link below.
 *
 * This is similar to what you can do with something like Express, but it
 * doesn't have the weight of using Express fully.
 *
 * https://github.com/davidtucker/lambda-micro
 */
const router = createRouter(RouterType.HTTP_API_V2);

// Get all comments for a document
// GET /comments/{:docid}
router.add(Matcher.HttpApiV2("GET", "/comments/{:docid}"), getAllCommentsForDocument);

// Create a new comment  for a document
// POST /comments/{:docid}
router.add(Matcher.HttpApiV2("POST", "/comments/{:docid}"), createComment);

// Delete a comment for a document
// DELETE /comments/{:docid}/{:commentid}
router.add(Matcher.HttpApiV2("DELETE", "/comments/{:docid}/{:commentid}"), deleteComment);

// Lambda handler
function handleComments(event, context) {
  return router.run(event, context);
}

export { handleComments };
