import { awsClients } from "../common";

// Setup Textract client
const textract = awsClients.textract();

// Lambda handler
async function detectDocumentText(event) {
  const textDetectionParams = {
    DocumentLocation: {
      S3Object: {
        Bucket: event.file.bucket,
        Name: event.file.key,
      },
    },
  };
  const data = await textract.startDocumentTextDetection(textDetectionParams).promise();
  const output = {
    textDetection: {
      jobId: data.JobId,
    },
  };

  return {
    ...event,
    ...output,
  };
}

export { detectDocumentText };
