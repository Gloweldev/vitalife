const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { config } = require('../config');

const s3Client = new S3Client({
    region: config.aws.region,
    endpoint: config.aws.endpoint,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
    forcePathStyle: true,
});

class S3Service {
    static async uploadFile(file, folder = 'products') {
        const key = `${folder}/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await s3Client.send(command);

        // Return the key, not the full URL (we'll generate presigned URLs when needed)
        return key;
    }

    static async getPresignedUrl(key, expiresIn = 3600) {
        // If key is null/undefined, return null
        if (!key) return null;

        // If already a full URL (presigned or public), return as-is
        if (key.startsWith('http://') || key.startsWith('https://')) {
            return key;
        }

        // Generate presigned URL for private bucket access
        const command = new GetObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return presignedUrl;
    }

    // Long-duration presigned URL for ISR/cached content (1 week)
    static async getLongPresignedUrl(key) {
        // If key is null/undefined, return null
        if (!key) return null;

        // If already a full URL, return as-is
        if (key.startsWith('http://') || key.startsWith('https://')) {
            return key;
        }

        const ONE_WEEK = 604800; // 7 days in seconds
        return this.getPresignedUrl(key, ONE_WEEK);
    }

    static async deleteFile(key) {
        // Extract key if full URL was passed
        if (key.includes('/')) {
            const parts = key.split('/');
            const bucketIndex = parts.indexOf(config.aws.bucketName);
            if (bucketIndex !== -1) {
                key = parts.slice(bucketIndex + 1).join('/');
            }
        }

        const command = new DeleteObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
        });

        await s3Client.send(command);
    }
}

module.exports = { S3Service };
