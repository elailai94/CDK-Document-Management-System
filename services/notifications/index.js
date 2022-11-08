import { awsClients } from "../common";

// Setup SES client
const ses = awsClients.ses();

// Get environment variable values
const emailAddress = process.env.EMAIL_ADDRESS;

async function sendEmail(message, subject) {
  const params = {
    Destination: {
      ToAddresses: [emailAddress],
    },
    Message: {
      Body: {
        Text: {
          Data: message,
        },
      },
      Subject: {
        Data: `[Globomantics DMS] ${subject}`,
      },
    },
    Source: emailAddress,
  };

  return ses.sendEmail(params).promise();
}

async function handleCommentAdded(event) {
  const { documentID, commentID } = event.detail;

  if (!documentID || !commentID) {
    // eslint-disable-next-line no-console
    console.error("Document ID and Comment ID not provided for notification from EventBridge");
    throw new Error("Could not send notifications for a comment");
  }

  const message = "Document Comment";
  const subject = `Comment left on document ${documentID}`;

  try {
    await sendEmail(message, subject);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Could not send email on CommentAdded event: ${error}`);
  }
}

async function handleProcessingFailed(event) {
  const filename = event.detail?.filename;
  const owner = event.detail?.owner;

  if (!filename || !owner) {
    throw new Error("Did not receive filename and or owner with event");
  }

  const message = `Your file, ${filename}, failed to process. It may be encrypted. Please update your file and try again.`;
  const subject = "Document Failed Processing";

  try {
    await sendEmail(message, subject);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Could not send email on FailedProcessing event: ${error}`);
  }
}

// Lambda handler
async function sendNotification(event) {
  const { source } = event;
  const detailType = event["detail-type"];

  if (source === "com.globomantics.dms.processing" && detailType === "ProcessingFailed") {
    return handleProcessingFailed(event);
  }

  if (source === "com.globomantics.dms.comments" && detailType === "CommentAdded") {
    return handleCommentAdded(event);
  }

  // eslint-disable-next-line no-console
  console.error(`Notification event not handled: ${JSON.stringify(event)}`);

  throw new Error("Event not handled");
}

export { sendNotification };
