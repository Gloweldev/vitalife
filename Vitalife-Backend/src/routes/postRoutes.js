const express = require('express');
const postController = require('../controllers/postController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes (protected) - MUST be before parameterized routes
router.get('/admin/list', verifyFirebaseToken, postController.getAdminPosts);
router.get('/admin/:id', verifyFirebaseToken, postController.getPostById);
router.patch('/bulk-update', verifyFirebaseToken, postController.bulkUpdatePosts);

// Public routes
router.get('/', postController.getPosts);
router.get('/:slug', postController.getPostBySlug);

// Admin CRUD routes (protected)
router.post('/', verifyFirebaseToken, postController.createPost);
router.put('/:id', verifyFirebaseToken, postController.updatePost);
router.delete('/:id', verifyFirebaseToken, postController.deletePost);

module.exports = router;
