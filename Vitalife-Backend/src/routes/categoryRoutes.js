const express = require('express');
const { CategoryController } = require('../controllers/categoryController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected routes (require admin auth)
router.post('/', verifyFirebaseToken, CategoryController.createCategory);
router.put('/:id', verifyFirebaseToken, CategoryController.updateCategory);
router.delete('/:id', verifyFirebaseToken, CategoryController.deleteCategory);

module.exports = router;
