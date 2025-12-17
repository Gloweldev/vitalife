const express = require('express');
const blogCategoryController = require('../controllers/blogCategoryController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - get all categories
router.get('/', blogCategoryController.getCategories);

// Protected routes - admin only
router.post('/', verifyFirebaseToken, blogCategoryController.createCategory);
router.put('/:id', verifyFirebaseToken, blogCategoryController.updateCategory);
router.delete('/:id', verifyFirebaseToken, blogCategoryController.deleteCategory);

module.exports = router;
