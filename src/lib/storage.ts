import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

function createS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing S3 configuration. Make sure S3_ENDPOINT, S3_ACCESS_KEY, and S3_SECRET_KEY are set."
    );
  }

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

function getBucketName(): string {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error("S3_BUCKET_NAME environment variable is not set");
  return bucket;
}

function buildPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
  const bucket = getBucketName();
  return `${endpoint}/${bucket}/${key}`;
}

function extractKeyFromUrl(url: string): string | null {
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, "");
  if (!endpoint) return null;
  const bucket = getBucketName();
  const prefix = `${endpoint}/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  const client = createS3Client();
  const bucket = getBucketName();
  const ext = path.extname(originalName).toLowerCase();
  const key = `uploads/${randomUUID()}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  return buildPublicUrl(key);
}

export async function deleteFile(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;

  const client = createS3Client();
  const bucket = getBucketName();

  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}
