const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs/promises');
const fss = require('fs');
const path = require('path');

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY;
const CLOUD_ENABLED = !!(S3_ENDPOINT && S3_BUCKET && S3_ACCESS_KEY && S3_SECRET_KEY);

const INDEX_KEY = 'index.json';

// --- Local filesystem fallback (dev / test) ---

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const LOCAL_INDEX_PATH = path.join(UPLOAD_DIR, INDEX_KEY);

function ensureUploadDir() {
  if (!fss.existsSync(UPLOAD_DIR)) {
    fss.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

async function localReadIndex() {
  try {
    const data = await fs.readFile(LOCAL_INDEX_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function localWriteIndex(materials) {
  ensureUploadDir();
  await fs.writeFile(LOCAL_INDEX_PATH, JSON.stringify(materials, null, 2), 'utf-8');
}

async function localUploadFile(key, filePath) {
  ensureUploadDir();
  const destPath = path.join(UPLOAD_DIR, key);
  await fs.copyFile(filePath, destPath);
}

async function localDeleteFile(key) {
  const filePath = path.join(UPLOAD_DIR, key);
  try { await fs.unlink(filePath); } catch { /* ignore */ }
}

async function localGetFileStream(key) {
  const filePath = path.join(UPLOAD_DIR, key);
  try {
    await fs.access(filePath);
  } catch {
    return null;
  }
  return fss.createReadStream(filePath);
}

// --- S3-compatible cloud storage (Supabase / R2 / etc.) ---

let s3Client = null;

function getS3Client() {
  if (s3Client) return s3Client;
  s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true,
  });
  return s3Client;
}

async function cloudReadIndex() {
  try {
    const resp = await getS3Client().send(new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: INDEX_KEY,
    }));
    const body = await resp.Body.transformToString('utf-8');
    const parsed = JSON.parse(body);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function cloudWriteIndex(materials) {
  await getS3Client().send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: INDEX_KEY,
    Body: JSON.stringify(materials, null, 2),
    ContentType: 'application/json',
  }));
}

async function cloudUploadFile(key, filePath, contentType) {
  const fileBuffer = await fs.readFile(filePath);
  await getS3Client().send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType || 'application/octet-stream',
  }));
}

async function cloudDeleteFile(key) {
  await getS3Client().send(new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  }));
}

async function cloudGetFileStream(key) {
  try {
    const resp = await getS3Client().send(new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));
    return resp.Body;
  } catch {
    return null;
  }
}

// --- Public API ---

function isCloudEnabled() {
  return CLOUD_ENABLED;
}

async function readIndex() {
  return CLOUD_ENABLED ? cloudReadIndex() : localReadIndex();
}

async function writeIndex(materials) {
  return CLOUD_ENABLED ? cloudWriteIndex(materials) : localWriteIndex(materials);
}

async function uploadFile(key, filePath, contentType) {
  return CLOUD_ENABLED ? cloudUploadFile(key, filePath, contentType) : localUploadFile(key, filePath);
}

async function deleteFile(key) {
  return CLOUD_ENABLED ? cloudDeleteFile(key) : localDeleteFile(key);
}

async function getFileStream(key) {
  return CLOUD_ENABLED ? cloudGetFileStream(key) : localGetFileStream(key);
}

module.exports = {
  isCloudEnabled,
  readIndex,
  writeIndex,
  uploadFile,
  deleteFile,
  getFileStream,
  UPLOAD_DIR,
  LOCAL_INDEX_PATH,
};
