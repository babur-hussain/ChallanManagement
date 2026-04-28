import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// ═══════════════════════════════════════════════════════════════
// AWS S3 Client
// Supports LocalStack in development, real AWS in production
// ═══════════════════════════════════════════════════════════════

let s3Client: S3Client | null = null;

export function createS3Client(): S3Client {
  if (s3Client) return s3Client;

  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  };

  // For LocalStack: override endpoint and force path-style access
  if (env.AWS_S3_ENDPOINT) {
    config.endpoint = env.AWS_S3_ENDPOINT;
    config.forcePathStyle = true;
  }

  s3Client = new S3Client(config);

  logger.info('✅ S3 client initialized', {
    region: env.AWS_REGION,
    bucket: env.AWS_S3_BUCKET,
    endpoint: env.AWS_S3_ENDPOINT || 'AWS (production)',
  });

  return s3Client;
}

export function getS3Client(): S3Client {
  if (!s3Client) {
    throw new Error('S3 client not initialized. Call createS3Client() first.');
  }
  return s3Client;
}

/**
 * Ensure the S3 bucket exists (creates it in LocalStack if needed)
 */
export async function ensureBucket(): Promise<void> {
  const client = getS3Client();
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET }));
    logger.info(`✅ S3 bucket "${env.AWS_S3_BUCKET}" exists`);
  } catch {
    if (env.AWS_S3_ENDPOINT) {
      // Only auto-create in LocalStack
      logger.info(`Creating S3 bucket "${env.AWS_S3_BUCKET}" in LocalStack...`);
      await client.send(new CreateBucketCommand({ Bucket: env.AWS_S3_BUCKET }));
      logger.info(`✅ S3 bucket "${env.AWS_S3_BUCKET}" created`);
    } else {
      logger.error(`❌ S3 bucket "${env.AWS_S3_BUCKET}" not found`);
      throw new Error(`S3 bucket "${env.AWS_S3_BUCKET}" does not exist`);
    }
  }
}

export async function checkS3Health(): Promise<boolean> {
  try {
    if (!s3Client) return false;
    await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET }));
    return true;
  } catch {
    return false;
  }
}
