// backend/server/lib/r2.js
//
// Thin wrapper around the S3 SDK pointed at Cloudflare R2 (R2 speaks the S3
// API, so no R2-specific SDK is needed). Used by routes/admin.js to store
// uploaded audio/cover files. Render's own disk is ephemeral — anything
// written there disappears on the next redeploy/restart — so uploaded
// files have to live somewhere else entirely, same reasoning as the
// Mongo Atlas migration for user data.
const crypto = require("crypto");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_BASE_URL, // e.g. https://pub-xxxx.r2.dev or your custom domain, no trailing slash
} = process.env;

const configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_BASE_URL
);

let client = null;
if (configured) {
  client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

function isConfigured() {
  return configured;
}

// Uploads a buffer under a random key (keeping the original extension, if
// any, for a sane content-type guess by clients/CDNs) and returns its
// public URL. `prefix` just keeps audio/ and covers/ visually separated in
// the bucket.
async function uploadBuffer(buffer, { prefix, originalName, contentType }) {
  if (!client) {
    throw new Error(
      "R2 is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, " +
        "R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL (see DEPLOYMENT.md)."
    );
  }

  const ext = (originalName?.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${prefix}/${crypto.randomUUID()}${ext ? "." + ext : ""}`;

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    })
  );

  return { key, url: `${R2_PUBLIC_BASE_URL}/${key}` };
}

async function deleteObject(key) {
  if (!client || !key) return;
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
}

module.exports = { isConfigured, uploadBuffer, deleteObject };
