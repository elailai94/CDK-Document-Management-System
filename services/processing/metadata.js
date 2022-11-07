import * as path from "path";

import { PDFDocument } from "pdf-lib";
import { awsClients } from "../common";

// Setup S3 client
const s3 = awsClients.s3();

function getMetadataFromDocument(document) {
  return {
    author: document.getAuthor(),
    createdDate: document.getCreationDate(),
    keywords: document.getKeywords(),
    modifiedDate: document.getModificationDate(),
    pageCount: document.getPageCount(),
    title: document.getTitle(),
  };
}

// Lambda handler
async function getDocumentMetadata(event) {
  // Make sure we are getting an s3 event
  if (event.source !== "aws.s3") {
    throw new Error("Invalid event source");
  }

  // Check file extension
  const extension = path.extname(event.detail.requestParameters.key);
  if (extension.toLowerCase() !== ".pdf") {
    throw new Error("Unsupported file type");
  }

  // Download the file from S3
  const getObjectParams = {
    Bucket: event.detail.requestParameters.bucketName,
    Key: event.detail.requestParameters.key,
  };
  const data = await s3.getObject(getObjectParams).promise();

  // Get PDF metadata
  const metadataParams = {
    updateMetadata: false,
  };
  const document = await PDFDocument.load(data.Body, metadataParams);
  const metadata = getMetadataFromDocument(document);

  // Upload to assets bucket
  const putObjectParams = {
    Body: data.Body,
    Bucket: process.env.ASSET_BUCKET,
    Key: event.detail.requestParameters.key,
  };
  await s3.putObject(putObjectParams).promise();

  return {
    file: {
      bucket: event.detail.requestParameters.bucketName,
      key: event.detail.requestParameters.key,
      size: data.Body.length,
    },
    metadata,
  };
}

export { getDocumentMetadata };
