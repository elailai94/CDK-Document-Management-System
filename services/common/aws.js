/**
 * AWS Clients
 *
 * This file exports functions to create each of the AWS clients that will
 * be used throughout this application. By having all of these in one
 * location, it will be easier to implement tracing for AWS service calls.
 */

import * as aws from "aws-sdk";

let _dynamoDB = null;

/**
 * Creates the DynamoDB client for use in the application.
 *
 * @returns {object} DynamoDB client
 */
const dynamoDB = () => {
  if (!_dynamoDB) {
    _dynamoDB = new aws.DynamoDB.DocumentClient();
  }

  return _dynamoDB;
};

const awsClients = {
  dynamoDB,
};

export { awsClients };
