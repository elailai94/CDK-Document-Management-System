import { awsClients } from "../common";

// Setup Textract client
const textract = awsClients.textract();

async function getResults(event, nextToken = null) {
  const { jobId } = event.textDetection;
  const params = {
    JobId: jobId,
    MaxResults: 1000,
  };

  if (nextToken) {
    params.NextToken = nextToken;
  }

  const data = await textract.getDocumentTextDetection(params).promise();
  let textOutput = "";

  if (data.JobStatus === "SUCCEEDED") {
    // Get blocks that are 'words' (and not pages or lines)
    const lineBlocks = data.Blocks.filter(block => block.BlockType === "WORD");
    // Get an array of text values from these blocks
    const lineTexts = lineBlocks.map(block => block.Text);
    // Join this array of text together, by putting a space between each element
    textOutput = lineTexts.join(" ").trim();

    if (data.nextToken) {
      // Delay 1 second to avoid exceeding provisioned rate for Textract
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });

      const { outputText: nextText } = await getResults(event, data.NextToken);

      if (nextText) {
        textOutput += ` ${nextText}`;
      }
    }
  } else if (data.JobStatus === "FAILED") {
    throw new Error("Could not detect text from document");
  }

  return {
    jobId,
    jobStatus: data.JobStatus,
    textOutput,
  };
}

// Lambda handler
async function getDetectionResults(event) {
  const { jobId } = event.textDetection;

  // eslint-disable-next-line no-console
  console.info(`Getting text detection results. JOB ID: ${jobId}`);

  const results = await getResults(event);

  return {
    ...event,
    textDetection: results,
  };
}

export { getDetectionResults };
