import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } =
  process.env;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

let R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_BASE_URL ||
  ''
).trim();

if (R2_PUBLIC_URL) {
  if (!R2_PUBLIC_URL.startsWith('http')) {
    R2_PUBLIC_URL = `https://${R2_PUBLIC_URL}`;
  }
  R2_PUBLIC_URL = R2_PUBLIC_URL.replace(/\/$/, '');
}

export const deleteFileFromR2 = async (urlOrKey: string) => {
  if (!urlOrKey) return;

  let key = urlOrKey;
  if (key.includes(R2_PUBLIC_URL)) {
    key = key.replace(`${R2_PUBLIC_URL}/`, '');
  }

  if (key.startsWith('/')) key = key.slice(1);

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log('Delete 삭제 성공');
  } catch (error) {
    console.error('Delete Error', error);
  }
};

export { s3Client };
