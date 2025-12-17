const multer = require('multer');
const { S3Service } = require('../services/s3Service');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// Multer middleware for single file upload
const uploadMiddleware = upload.single('file');

// POST /api/uploads/blog - Upload blog image
async function uploadBlogImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to S3 in blog folder
        const key = await S3Service.uploadFile(req.file, 'blog');

        // Generate preview URL for immediate display in editor
        const previewUrl = await S3Service.getPresignedUrl(key);

        console.log(`✅ Blog image uploaded: ${key}`);

        return res.json({
            key,
            previewUrl,
        });
    } catch (error) {
        console.error('Error uploading blog image:', error);
        return res.status(500).json({ error: 'Error uploading image' });
    }
}

// POST /api/uploads/post-cover - Upload post cover image
async function uploadPostCover(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to S3 in blog/covers folder
        const key = await S3Service.uploadFile(req.file, 'blog/covers');

        // Generate preview URL
        const previewUrl = await S3Service.getPresignedUrl(key);

        console.log(`✅ Post cover uploaded: ${key}`);

        return res.json({
            key,
            previewUrl,
        });
    } catch (error) {
        console.error('Error uploading post cover:', error);
        return res.status(500).json({ error: 'Error uploading cover image' });
    }
}

// DELETE /api/uploads - Delete uploaded file
async function deleteUpload(req, res) {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ error: 'File key is required' });
        }

        // Only allow deleting blog files
        if (!key.startsWith('blog/')) {
            return res.status(403).json({ error: 'Cannot delete this file' });
        }

        await S3Service.deleteFile(key);

        console.log(`✅ File deleted: ${key}`);

        return res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ error: 'Error deleting file' });
    }
}

// POST /api/uploads/cleanup - Cleanup orphaned images (for sendBeacon)
async function cleanupOrphanedImages(req, res) {
    try {
        const { keys } = req.body;

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            return res.status(400).json({ error: 'Keys array is required' });
        }

        console.log(`🧹 Cleaning up ${keys.length} orphaned images...`);

        const results = await Promise.allSettled(
            keys.map(async (key) => {
                if (typeof key === 'string' && key.startsWith('blog/')) {
                    await S3Service.deleteFile(key);
                    console.log(`  ✅ Deleted: ${key}`);
                    return { key, success: true };
                }
                return { key, success: false, reason: 'Invalid key' };
            })
        );

        const deleted = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

        return res.json({
            message: `Cleaned up ${deleted} images`,
            deleted
        });
    } catch (error) {
        console.error('Error cleaning up images:', error);
        return res.status(500).json({ error: 'Error cleaning up images' });
    }
}

module.exports = {
    uploadMiddleware,
    uploadBlogImage,
    uploadPostCover,
    deleteUpload,
    cleanupOrphanedImages,
};
