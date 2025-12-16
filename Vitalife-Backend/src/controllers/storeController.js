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

            // Build where clause
            const where = {};

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
}

module.exports = { StoreController };
