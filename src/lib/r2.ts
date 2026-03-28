import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

interface UploadToR2Input {
  userId: string;
  fileName: string;
  body: Buffer;
  contentType?: string;
}

interface UploadToR2Result {
  key: string;
  publicUrl: string | null;
}

interface R2Object {
  body: unknown;
  contentType: string | undefined;
  contentLength: number | undefined;
}

const FALLBACK_REGION = "auto";
let cachedClient: S3Client | null = null;
let cachedBucketName: string | null = null;

const R2_KEY_YEAR_REGEX = /^\d{4}$/;
const R2_KEY_MONTH_REGEX = /^(0[1-9]|1[0-2])$/;
const R2_KEY_FILE_REGEX = /^[0-9a-f-]{36}-[a-z0-9][a-z0-9._-]*$/;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getR2Endpoint(): string {
  if (process.env.CLOUDFLARE_R2_ENDPOINT) {
    return process.env.CLOUDFLARE_R2_ENDPOINT;
  }

  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  if (!accountId) {
    throw new Error(
      "Missing CLOUDFLARE_R2_ENDPOINT or CLOUDFLARE_R2_ACCOUNT_ID for Cloudflare R2."
    );
  }

  return `https://${accountId}.r2.cloudflarestorage.com`;
}

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: process.env.CLOUDFLARE_R2_REGION ?? FALLBACK_REGION,
    endpoint: getR2Endpoint(),
    credentials: {
      accessKeyId: getRequiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    },
  });

  return cachedClient;
}

function getBucketName(): string {
  if (cachedBucketName) return cachedBucketName;
  cachedBucketName = getRequiredEnv("CLOUDFLARE_R2_BUCKET_NAME");
  return cachedBucketName;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createR2Key(userId: string, fileName: string): string {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const random = randomUUID();
  const safeName = sanitizeFileName(fileName) || "upload";
  return `${userId}/${year}/${month}/${random}-${safeName}`;
}

function removeLeadingSlash(path: string): string {
  if (path.startsWith("/")) return path.slice(1);
  return path;
}

export function isR2KeyOwnedByUser(userId: string, key: string): boolean {
  const normalizedKey = removeLeadingSlash(key.trim());
  const parts = normalizedKey.split("/");

  if (parts.length !== 4) return false;

  const [ownerId, year, month, filePart] = parts;
  if (ownerId !== userId) return false;
  if (!R2_KEY_YEAR_REGEX.test(year)) return false;
  if (!R2_KEY_MONTH_REGEX.test(month)) return false;
  if (!R2_KEY_FILE_REGEX.test(filePart)) return false;

  return true;
}

export function getR2PublicUrl(key: string): string | null {
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!baseUrl) return null;

  const normalized = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalized}/${removeLeadingSlash(key)}`;
}

export async function uploadToR2({
  userId,
  fileName,
  body,
  contentType,
}: UploadToR2Input): Promise<UploadToR2Result> {
  const key = createR2Key(userId, fileName);
  const r2Client = getR2Client();
  const bucketName = getBucketName();

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    publicUrl: getR2PublicUrl(key),
  };
}

export async function deleteFromR2(key: string): Promise<void> {
  const r2Client = getR2Client();
  const bucketName = getBucketName();

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: removeLeadingSlash(key),
      })
    );
  } catch (error) {
    const errorName =
      typeof error === "object" && error && "name" in error
        ? String(error.name)
        : "";

    if (errorName === "NoSuchKey") {
      return;
    }

    throw error;
  }
}

export async function getFromR2(key: string): Promise<R2Object> {
  const r2Client = getR2Client();
  const bucketName = getBucketName();

  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: removeLeadingSlash(key),
    })
  );

  return {
    body: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}
