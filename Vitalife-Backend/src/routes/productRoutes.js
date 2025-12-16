const express = require('express');
const multer = require('multer');
const { ProductController } = require('../controllers/productController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Protected routes
router.post(
    '/',
    verifyFirebaseToken,
    upload.array('images', 5),
    ProductController.createProduct
);

router.put(
    '/:id',
    verifyFirebaseToken,
    upload.array('images', 5),
    ProductController.updateProduct
);

router.delete(
    '/:id',
    verifyFirebaseToken,
    ProductController.deleteProduct
);

// Bulk update category for multiple products
router.patch(
    '/bulk-update',
    verifyFirebaseToken,
    ProductController.bulkUpdateCategory
);

module.exports = router;
