const express = require('express');
const uploadController = require('../controllers/uploadController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/blog',
    verifyFirebaseToken,
    uploadController.uploadMiddleware,
    uploadController.uploadBlogImage
);

router.post(
    '/post-cover',
    verifyFirebaseToken,
    uploadController.uploadMiddleware,
    uploadController.uploadPostCover
);

router.delete(
    '/',
    verifyFirebaseToken,
    uploadController.deleteUpload
);

// Cleanup route for sendBeacon (called on tab close)
// Note: sendBeacon can't send auth headers, so this is public but only deletes blog/* files
router.post(
    '/cleanup',
    express.json({ type: 'text/plain' }), // sendBeacon sends as text/plain
    uploadController.cleanupOrphanedImages
);

module.exports = router;
