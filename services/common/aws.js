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

let _eventbridge = null;

/**
 * Creates the EventBridge client for use in the application.
 *
 * @returns {object} EventBridge client
 */
const eventbridge = () => {
  if (!_eventbridge) {
    _eventbridge = new aws.EventBridge();
  }

  return _eventbridge;
};

let _s3 = null;

/**
 * Creates the S3 client for use in the application.
 *
 * @returns {object} S3 client
 */
const s3 = () => {
  if (!_s3) {
    _s3 = new aws.S3();
  }

  return _s3;
};

let _ses = null;

/**
 * Creates the SES client for use in the application.
 * 
 * @returns {object} SES client
 */
const ses = () => {
  if (!_ses) {
    _ses = new aws.SES();
  }

  return _ses;
};

let _textract = null;

/**
 * Creates the Textract client for use in the application.
 *
 * @returns {object} Textract client
 */
const textract = () => {
  if (!_textract) {
    _textract = new aws.Textract();
  }

  return _textract;
};

const awsClients = {
  dynamoDB,
  eventbridge,
  s3,
  ses,
  textract,
};

export { awsClients };
