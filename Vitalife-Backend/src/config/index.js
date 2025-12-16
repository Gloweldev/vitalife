require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL,
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        bucketName: process.env.AWS_BUCKET_NAME,
        endpoint: process.env.AWS_ENDPOINT,
    },
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? 'https://your-production-domain.com'
            : 'http://localhost:3001',
    },
};

module.exports = { config };
