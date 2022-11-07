import * as path from "path";

import { exec } from "child_process";
import { promises } from "fs";
import { promisify } from "util";
import { awsClients } from "../common";

// Setup S3 client
const s3 = awsClients.s3();

const execCommand = promisify(exec);

function getCommand(inputFile, outputFile) {
  let command = "/opt/bin/gs";
  command += " -sDEVICE=png16m";
  command += " -dPDFFitPage=true";
  command += " -sPageList=1";
  command += " -sPAPERSIZE=a4";
  command += " -r150";
  command += ` -o ${outputFile} ${inputFile}`;

  return command;
}

// Lambda handler
async function generateDocumentThumbnail(event) {
  const timestamp = new Date().getTime();
  const inputFile = path.resolve("/tmp", `${timestamp}-input.pdf`);
  const outputFile = path.resolve("/tmp", `${timestamp}-output.png`);

  // Download the file from S3
  const getObjectParams = {
    Bucket: event.file.bucket,
    Key: event.file.key,
  };

  const data = await s3.getObject(getObjectParams).promise();
  await promises.writeFile(inputFile, data.Body);

  // Run Ghostscript command line
  await execCommand("/opt/bin/gs --version");
  await execCommand(getCommand(inputFile, outputFile));

  // Upload file to S3
  const thumbnailName = `${path.basename(event.file.key, ".pdf")}-thumb.png`;
  const putObjectParams = {
    Body: await promises.readFile(outputFile),
    Bucket: process.env.ASSET_BUCKET,
    Key: thumbnailName,
  };

  await s3.putObject(putObjectParams).promise();

  const output = {
    thumbnail: {
      bucket: process.env.ASSET_BUCKET,
      key: thumbnailName,
    },
  };

  return {
    ...event,
    ...output,
  };
}

export { generateDocumentThumbnail };
