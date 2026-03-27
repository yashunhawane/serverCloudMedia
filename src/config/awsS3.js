import "./env.js";
import { S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "./env.js";

const s3Client = new S3Client({
  region: requireEnv("AWS_REGION"),
  credentials: {
    accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

export const BUCKET_NAME = requireEnv("AWS_BUCKET_NAME");
export default s3Client;
