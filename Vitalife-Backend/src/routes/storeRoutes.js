const express = require('express');
const rateLimit = require('express-rate-limit');
const { StoreController } = require('../controllers/storeController');

const router = express.Router();

// Standard rate limiter for public store endpoints
// 60 requests per minute per IP - sufficient for humans, blocks bots
const storeRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: {
        error: 'Too many requests. Please try again in a minute.',
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    },
});

// Stricter rate limiter for sitemap/bulk requests
// 10 requests per minute per IP
const bulkRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        error: 'Too many bulk requests. Please try again later.',
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    },
    // Skip if limit query param is small (normal browsing)
    skip: (req) => {
        const limit = parseInt(req.query.limit) || 12;
        return limit <= 20;
    },
});

// Apply rate limiters
router.use(storeRateLimiter);

// Public endpoints
router.get('/products', bulkRateLimiter, StoreController.getProducts);
router.get('/products/:slug', StoreController.getProductBySlug);
router.get('/categories', StoreController.getCategories);

module.exports = router;
