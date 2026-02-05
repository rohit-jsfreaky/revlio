import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize R2 client
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "revlio-uploads";

// Generate a unique filename for uploads
export function generateFileName(
  userId: string,
  originalName: string,
  folder = "avatars"
): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${folder}/${userId}/${timestamp}-${randomId}.${ext}`;
}

// Upload file to R2
export async function uploadToR2(
  file: Buffer | ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!publicUrl) {
    throw new Error("R2 public URL not configured");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file instanceof ArrayBuffer ? Buffer.from(file) : file,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000",
  });

  await client.send(command);

  return `${publicUrl}/${fileName}`;
}

// Delete file from R2
export async function deleteFromR2(fileName: string): Promise<void> {
  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  await client.send(command);
}

// Get signed upload URL for direct client uploads (optional, for larger files)
export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

// Extract key from full URL
export function extractKeyFromUrl(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl || !url.startsWith(publicUrl)) return null;
  return url.replace(`${publicUrl}/`, "");
}
