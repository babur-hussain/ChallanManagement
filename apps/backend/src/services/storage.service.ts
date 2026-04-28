import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../lib/s3.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export class StorageService {
    static async uploadFile(businessId: string, file: any, folder: string = 'documents'): Promise<string> {
        const client = getS3Client();
        const extension = path.extname(file.originalname || file.name || '');
        const filename = `${businessId}/${folder}/${crypto.randomUUID()}${extension}`;

        try {
            let body = file.buffer;
            if (!body && file.path) {
                body = fs.readFileSync(file.path);
            }

            const command = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET,
                Key: filename,
                Body: body,
                ContentType: file.mimetype || 'application/octet-stream',
            });

            await client.send(command);

            // Return URL (using path-style for LocalStack compatibility or virtual host in prod)
            if (env.AWS_S3_ENDPOINT) {
                return `${env.AWS_S3_ENDPOINT}/${env.AWS_S3_BUCKET}/${filename}`;
            }
            return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${filename}`;
        } catch (error: any) {
            logger.error(`Failed to upload file to S3 bucket "${env.AWS_S3_BUCKET}": ${error?.name || 'Unknown'} - ${error?.message || error}`);
            if (error?.errors) {
                for (const e of error.errors) {
                    logger.error(`  S3 sub-error: ${e?.name} - ${e?.message}`);
                }
            }
            throw error;
        }
    }
}
