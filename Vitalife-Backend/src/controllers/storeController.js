const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { S3Service } = require('../services/s3Service');

const prisma = new PrismaClient();

// Input validation schema
const storeQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(20).default(10),
    search: z.string().max(50).optional(),
    category: z.string().uuid().optional(),
    featured: z.enum(['true', 'false']).optional(),
});

// Sanitize search input - remove dangerous characters
function sanitizeSearch(input) {
    if (!input) return '';

    // Remove HTML/script tags, SQL-like patterns, special chars
    return input
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/[;'"\\]/g, '')  // Remove quotes, semicolons, backslashes
        .replace(/--/g, '')       // Remove SQL comments
        .replace(/\/\*/g, '')     // Remove block comments
        .replace(/\*\//g, '')
        .trim()
        .substring(0, 50);        // Limit length
}

class StoreController {
    /**
     * GET /api/store/products
     * Public endpoint with caching support
     */
    static async getProducts(req, res) {
        try {
            // Validate and parse query params
            const validation = storeQuerySchema.safeParse(req.query);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid query parameters',
                    details: validation.error.issues
                });
            }

            const { page, limit, search, category, featured } = validation.data;
            const skip = (page - 1) * limit;

            // Build where clause - ALWAYS filter active products for public store
            const where = {
                isActive: true,  // CRITICAL: Only show active products to public
            };

            // Search filter (sanitized)
            if (search) {
                const sanitizedSearch = sanitizeSearch(search);
                if (sanitizedSearch.length >= 2) {
                    where.OR = [
                        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
                        { shortDescription: { contains: sanitizedSearch, mode: 'insensitive' } },
                    ];
                }
            }

            // Category filter
            if (category) {
                where.categoryId = category;
            }

            // Featured filter
            if (featured === 'true') {
                where.isFeatured = true;
            }

            // Fetch products with optimized select (no audit fields)
            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where,
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        shortDescription: true,
                        fullDescription: true,
                        isFeatured: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        images: {
                            select: {
                                url: true,
                                isMain: true,
                            },
                            orderBy: {
                                isMain: 'desc'
                            }
                        },
                        flavors: {
                            select: {
                                name: true,
                            }
                        },
                        benefits: {
                            select: {
                                text: true,
                            }
                        },
                    },
                    orderBy: [
                        { isFeatured: 'desc' },
                        { name: 'asc' },
                    ],
                }),
                prisma.product.count({ where }),
            ]);

            // Transform response for frontend compatibility
            const transformedProducts = await Promise.all(
                products.map(async (product) => {
                    // Generate presigned URLs for images
                    const images = await Promise.all(
                        product.images.map(async (img) => {
                            try {
                                return await S3Service.getPresignedUrl(img.url);
                            } catch {
                                return img.url;
                            }
                        })
                    );

                    return {
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        category: product.category?.name || 'General',
                        categoryId: product.category?.id || null,
                        images,
                        description: product.shortDescription,
                        shortDescription: product.shortDescription,
                        fullDescription: product.fullDescription,
                        benefits: product.benefits.map(b => b.text),
                        flavors: product.flavors.map(f => f.name),
                        isFeatured: product.isFeatured,
                    };
                })
            );

            // Set cache headers for CDN/browser caching
            res.set({
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
                'Vary': 'Accept-Encoding',
            });

            return res.json({
                products: transformedProducts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                }
            });
        } catch (error) {
            console.error('Error fetching store products:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    /**
     * GET /api/store/products/:slug
     * Get single product detail by slug
     */
    static async getProductBySlug(req, res) {
        try {
            const { slug } = req.params;

            // Validate slug format (alphanumeric with hyphens)
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                return res.status(400).json({ error: 'Invalid product slug format' });
            }

            const product = await prisma.product.findUnique({
                where: { slug },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    shortDescription: true,
                    fullDescription: true,
                    isFeatured: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    images: {
                        select: {
                            url: true,
                            isMain: true,
                        },
                        orderBy: {
                            isMain: 'desc'
                        }
                    },
                    flavors: {
                        select: {
                            name: true,
                        }
                    },
                    benefits: {
                        select: {
                            text: true,
                        }
                    },
                },
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Generate presigned URLs
            const images = await Promise.all(
                product.images.map(async (img) => {
                    try {
                        return await S3Service.getPresignedUrl(img.url);
                    } catch {
                        return img.url;
                    }
                })
            );

            // Set cache headers
            res.set({
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            });

            return res.json({
                id: product.id,
                slug: product.slug,
                name: product.name,
                category: product.category?.name || 'General',
                categoryId: product.category?.id || null,
                images,
                description: product.shortDescription,
                shortDescription: product.shortDescription,
                fullDescription: product.fullDescription,
                benefits: product.benefits.map(b => b.text),
                flavors: product.flavors.map(f => f.name),
                isFeatured: product.isFeatured,
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    /**
     * GET /api/store/categories
     * Get all categories for filtering
     */
    static async getCategories(req, res) {
        try {
            const categories = await prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            // Set cache headers
            res.set({
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            });

            return res.json(
                categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    productCount: cat._count.products,
                }))
            );
        } catch (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    // ============================================
    // BLOG PUBLIC ENDPOINTS
    // ============================================

    /**
     * GET /api/store/posts
     * List published blog posts (optimized for cards)
     */
    static async getPublishedPosts(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
            const skip = (page - 1) * limit;
            const categoryId = req.query.category;

            // Build where clause - ONLY published posts
            const where = {
                status: 'published',
            };

            if (categoryId) {
                where.categoryId = categoryId;
            }

            // Fetch posts with optimized select
            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { publishedAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        coverImage: true,
                        publishedAt: true,
                        readTime: true,
                        postType: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                }),
                prisma.post.count({ where }),
            ]);

            // Process coverImage URLs (1 week expiry)
            const postsWithUrls = await Promise.all(
                posts.map(async (post) => ({
                    ...post,
                    coverImage: post.coverImage
                        ? await S3Service.getLongPresignedUrl(post.coverImage)
                        : null,
                }))
            );

            // Cache headers
            res.set({
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
            });

            return res.json({
                posts: postsWithUrls,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error('Error fetching published posts:', error);
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }
    }

    /**
     * GET /api/store/posts/:slug
     * Get single published post by slug
     */
    static async getPostBySlug(req, res) {
        try {
            const { slug } = req.params;

            const post = await prisma.post.findUnique({
                where: { slug },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            });

            // Not found OR not published = 404
            if (!post || post.status !== 'published') {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Process coverImage
            let coverImage = null;
            if (post.coverImage) {
                coverImage = await S3Service.getLongPresignedUrl(post.coverImage);
            }

            // Process content - generate presigned URLs for image blocks
            let content = post.content;
            if (Array.isArray(content)) {
                content = await Promise.all(
                    content.map(async (block) => {
                        if (block.type === 'image' && block.url && !block.url.startsWith('http')) {
                            return {
                                ...block,
                                url: await S3Service.getLongPresignedUrl(block.url),
                            };
                        }
                        return block;
                    })
                );
            }

            // NOTE: Views are now counted via POST /posts/:slug/view endpoint
            // with fingerprint deduplication (see registerPostView)

            // Cache headers
            res.set({
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
            });

            return res.json({
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                coverImage,
                content,
                category: post.category,
                author: post.author,
                readTime: post.readTime,
                views: post.views,
                publishedAt: post.publishedAt,
                postType: post.postType,
            });
        } catch (error) {
            console.error('Error fetching post by slug:', error);
            return res.status(500).json({ error: 'Failed to fetch post' });
        }
    }

    /**
     * GET /api/store/posts/product-preview/:id
     * Lightweight product preview for blog embeds
     */
    static async getProductPreview(req, res) {
        try {
            const { id } = req.params;

            const product = await prisma.product.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    shortDescription: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    images: {
                        where: { isMain: true },
                        take: 1,
                        select: { url: true },
                    },
                },
            });

            if (!product || product.isActive === false) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Get main image URL
            let image = null;
            if (product.images.length > 0) {
                image = await S3Service.getLongPresignedUrl(product.images[0].url);
            }

            // Cache headers (longer cache for product previews)
            res.set({
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            });

            return res.json({
                id: product.id,
                name: product.name,
                slug: product.slug,
                shortDescription: product.shortDescription,
                category: product.category?.name || null,
                image,
            });
        } catch (error) {
            console.error('Error fetching product preview:', error);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    /**
     * GET /api/store/blog-categories
     * Get all blog categories with post count
     */
    static async getBlogCategories(req, res) {
        try {
            const categories = await prisma.blogCategory.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    _count: {
                        select: {
                            posts: {
                                where: { status: 'published' },
                            },
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });

            // Cache headers
            res.set({
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            });

            return res.json(
                categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    postCount: cat._count.posts,
                }))
            );
        } catch (error) {
            console.error('Error fetching blog categories:', error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    /**
     * POST /api/store/posts/:slug/view
     * Register a post view with deduplication and metadata
     */
    static async registerPostView(req, res) {
        try {
            const { slug } = req.params;
            const { fingerprint, referrer: clientReferrer } = req.body;

            if (!fingerprint) {
                return res.status(400).json({ error: 'Fingerprint required' });
            }

            // Find post by slug
            const post = await prisma.post.findUnique({
                where: { slug },
                select: { id: true, status: true },
            });

            if (!post || post.status !== 'published') {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Get today's date for deduplication
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // Get visitor metadata
            const userAgent = req.headers['user-agent'] || '';
            const referrer = clientReferrer || req.headers['referer'] || null;

            // Anonymize IP (remove last octet for IPv4, last 80 bits for IPv6)
            let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '';
            if (ip.includes('.')) {
                // IPv4: zero out last octet
                ip = ip.split('.').slice(0, 3).join('.') + '.0';
            } else if (ip.includes(':')) {
                // IPv6: keep only first 48 bits
                ip = ip.split(':').slice(0, 3).join(':') + '::';
            }

            // Parse user agent for device/browser/os info
            const deviceInfo = parseUserAgent(userAgent);

            // Try to create view (will fail silently if duplicate due to unique constraint)
            try {
                await prisma.postView.create({
                    data: {
                        postId: post.id,
                        fingerprint,
                        viewDate: today,
                        ip,
                        userAgent: userAgent.substring(0, 500), // Limit length
                        referrer: referrer?.substring(0, 500) || null,
                        device: deviceInfo.device,
                        browser: deviceInfo.browser,
                        os: deviceInfo.os,
                    },
                });

                // Increment view count only for new unique views
                await prisma.post.update({
                    where: { id: post.id },
                    data: { views: { increment: 1 } },
                });

                console.log(`📊 New view for post ${slug} from ${deviceInfo.device}`);
                return res.json({ counted: true, message: 'View registered' });

            } catch (error) {
                // Unique constraint violation = duplicate view, don't count
                if (error.code === 'P2002') {
                    return res.json({ counted: false, message: 'Already viewed today' });
                }
                throw error;
            }
        } catch (error) {
            console.error('Error registering post view:', error);
            return res.status(500).json({ error: 'Failed to register view' });
        }
    }
}

// Helper: Parse user agent to extract device, browser, and OS info
function parseUserAgent(ua) {
    const result = {
        device: 'desktop',
        browser: 'unknown',
        os: 'unknown',
    };

    if (!ua) return result;

    // Device detection
    if (/mobile/i.test(ua)) {
        result.device = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
        result.device = 'tablet';
    }

    // Browser detection
    if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) {
        result.browser = 'Chrome';
    } else if (/firefox/i.test(ua)) {
        result.browser = 'Firefox';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        result.browser = 'Safari';
    } else if (/edge|edg/i.test(ua)) {
        result.browser = 'Edge';
    } else if (/opera|opr/i.test(ua)) {
        result.browser = 'Opera';
    }

    // OS detection
    if (/windows/i.test(ua)) {
        result.os = 'Windows';
    } else if (/mac os|macos/i.test(ua)) {
        result.os = 'macOS';
    } else if (/linux/i.test(ua) && !/android/i.test(ua)) {
        result.os = 'Linux';
    } else if (/android/i.test(ua)) {
        result.os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        result.os = 'iOS';
    }

    return result;
}

module.exports = { StoreController };
