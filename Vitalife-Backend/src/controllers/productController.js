const { PrismaClient } = require('@prisma/client');
const { S3Service } = require('../services/s3Service');
const { productSchema } = require('../validators/schemas');
const { generateSlug, generateUniqueSlug } = require('../utils/slugify');

const prisma = new PrismaClient();

class ProductController {
    static async getAllProducts(req, res) {
        try {
            const { search, categoryId } = req.query;

            // Build where clause
            const where = {};

            // Search by name (case-insensitive)
            if (search && search.trim()) {
                where.name = {
                    contains: search.trim(),
                    mode: 'insensitive',
                };
            }

            // Filter by category
            if (categoryId) {
                where.categoryId = categoryId;
            }

            const products = await prisma.product.findMany({
                where,
                include: {
                    images: true,
                    flavors: true,
                    benefits: true,
                    category: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Generate presigned URLs for all images
            const productsWithPresignedUrls = await Promise.all(
                products.map(async (product) => {
                    const imagesWithUrls = await Promise.all(
                        product.images.map(async (image) => ({
                            ...image,
                            url: await S3Service.getPresignedUrl(image.url),
                        }))
                    );
                    return {
                        ...product,
                        images: imagesWithUrls,
                    };
                })
            );

            return res.json(productsWithPresignedUrls);
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    static async getProductById(req, res) {
        try {
            const { id } = req.params;

            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    images: true,
                    flavors: true,
                    benefits: true,
                },
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Generate presigned URLs for images
            const imagesWithUrls = await Promise.all(
                product.images.map(async (image) => ({
                    ...image,
                    url: await S3Service.getPresignedUrl(image.url),
                }))
            );

            const productWithPresignedUrls = {
                ...product,
                images: imagesWithUrls,
            };

            return res.json(productWithPresignedUrls);
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    static async createProduct(req, res) {
        try {
            console.log('=== CREATE PRODUCT REQUEST ===');
            console.log('Body:', req.body);
            console.log('Files:', req.files ? req.files.length : 0);

            // Helper function to ensure array
            const ensureArray = (value) => {
                if (!value) return [];
                return Array.isArray(value) ? value : [value];
            };

            // Parse FormData
            const parsedBody = {
                name: req.body.name,
                shortDescription: req.body.shortDescription,
                fullDescription: req.body.fullDescription,
                categoryId: req.body.categoryId || null,
                isFeatured: req.body.isFeatured,
                flavors: ensureArray(req.body.flavors),
                benefits: ensureArray(req.body.benefits),
            };

            console.log('Parsed body:', parsedBody);

            // Validate request body with Zod
            const validationResult = productSchema.safeParse(parsedBody);

            if (!validationResult.success) {
                console.error('❌ Validation failed:');
                console.error('Errors:', validationResult.error.issues);
                return res.status(400).json({
                    error: 'Validation error',
                    details: validationResult.error.issues,
                });
            }

            console.log('✅ Validation passed');

            const {
                name,
                shortDescription,
                fullDescription,
                categoryId,
                isFeatured,
                flavors,
                benefits,
            } = validationResult.data;

            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({ error: 'At least one image is required' });
            }

            // Generate unique slug from product name
            const baseSlug = generateSlug(name);
            const slug = await generateUniqueSlug(prisma, baseSlug);

            console.log(`✅ Generated slug: ${slug}`);

            // Upload images to MinIO
            const imageUrls = await Promise.all(
                files.map(async (file, index) => {
                    const key = await S3Service.uploadFile(file, 'products');
                    return {
                        url: key,
                        isMain: index === 0,
                    };
                })
            );

            // Parse arrays
            const flavorsArray = flavors ? (Array.isArray(flavors) ? flavors : [flavors]) : [];
            const benefitsArray = Array.isArray(benefits) ? benefits : [benefits];

            // Create product with slug
            const product = await prisma.product.create({
                data: {
                    name,
                    slug,
                    description: shortDescription,
                    shortDescription,
                    fullDescription: fullDescription || '',
                    categoryId: categoryId || null,
                    isFeatured: isFeatured === 'true' || isFeatured === true,
                    images: {
                        create: imageUrls,
                    },
                    flavors: {
                        create: flavorsArray.map(name => ({ name })),
                    },
                    benefits: {
                        create: benefitsArray.map(text => ({ text })),
                    },
                },
                include: {
                    images: true,
                    flavors: true,
                    benefits: true,
                    category: true,
                },
            });

            // Generate presigned URLs for the response
            const imagesWithPresignedUrls = await Promise.all(
                product.images.map(async (image) => ({
                    ...image,
                    url: await S3Service.getPresignedUrl(image.url),
                }))
            );

            const productWithPresignedUrls = {
                ...product,
                images: imagesWithPresignedUrls,
            };

            return res.status(201).json(productWithPresignedUrls);
        } catch (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({
                error: 'Failed to create product',
                details: error.message
            });
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;

            console.log('=== UPDATE PRODUCT REQUEST ===');
            console.log('Product ID:', id);
            console.log('Body:', req.body);
            console.log('Files:', req.files ? req.files.length : 0);

            // Helper function to ensure array
            const ensureArray = (value) => {
                if (!value) return [];
                return Array.isArray(value) ? value : [value];
            };

            // Parse FormData
            const parsedBody = {
                name: req.body.name,
                shortDescription: req.body.shortDescription,
                fullDescription: req.body.fullDescription,
                categoryId: req.body.categoryId || null,
                isFeatured: req.body.isFeatured,
                flavors: ensureArray(req.body.flavors),
                benefits: ensureArray(req.body.benefits),
            };

            console.log('Parsed body:', parsedBody);

            // Validate request body
            const validationResult = productSchema.safeParse(parsedBody);

            if (!validationResult.success) {
                console.error('❌ Validation failed:');
                console.error('Errors:', validationResult.error.issues);
                return res.status(400).json({
                    error: 'Validation error',
                    details: validationResult.error.issues,
                });
            }

            console.log('✅ Validation passed');

            const {
                name,
                shortDescription,
                fullDescription,
                categoryId,
                isFeatured,
                flavors,
                benefits,
            } = validationResult.data;

            const files = req.files;

            const existingProduct = await prisma.product.findUnique({
                where: { id },
                include: { images: true },
            });

            if (!existingProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            let newImages = [];
            if (files && files.length > 0) {
                // Delete old images
                await Promise.all(
                    existingProduct.images.map(img => S3Service.deleteFile(img.url))
                );

                // Upload new images
                newImages = await Promise.all(
                    files.map(async (file, index) => {
                        const url = await S3Service.uploadFile(file, 'products');
                        return {
                            url,
                            isMain: index === 0,
                        };
                    })
                );
            }

            const flavorsArray = flavors ? (Array.isArray(flavors) ? flavors : [flavors]) : [];
            const benefitsArray = Array.isArray(benefits) ? benefits : [benefits];

            const updateData = {
                name,
                description: shortDescription,
                shortDescription,
                fullDescription: fullDescription || '',
                categoryId: categoryId || null,
                isFeatured: isFeatured === 'true' || isFeatured === true,
                flavors: {
                    deleteMany: {},
                    create: flavorsArray.map(name => ({ name })),
                },
                benefits: {
                    deleteMany: {},
                    create: benefitsArray.map(text => ({ text })),
                },
            };

            if (newImages.length > 0) {
                updateData.images = {
                    deleteMany: {},
                    create: newImages,
                };
            }

            const product = await prisma.product.update({
                where: { id },
                data: updateData,
                include: {
                    images: true,
                    flavors: true,
                    benefits: true,
                    category: true,
                },
            });

            return res.json(product);
        } catch (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({ error: 'Failed to update product' });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await prisma.product.findUnique({
                where: { id },
                include: { images: true },
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Delete images from S3
            await Promise.all(
                product.images.map(img => S3Service.deleteFile(img.url))
            );

            // Delete product
            await prisma.product.delete({
                where: { id },
            });

            return res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({ error: 'Failed to delete product' });
        }
    }

    // Bulk update category for multiple products
    static async bulkUpdateCategory(req, res) {
        try {
            const { productIds, newCategoryId } = req.body;

            console.log('=== BULK UPDATE CATEGORY ===');
            console.log('Product IDs:', productIds);
            console.log('New Category ID:', newCategoryId);

            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({
                    error: 'productIds must be a non-empty array'
                });
            }

            // Validate category exists if provided (can be null to remove category)
            if (newCategoryId) {
                const category = await prisma.category.findUnique({
                    where: { id: newCategoryId }
                });

                if (!category) {
                    return res.status(404).json({ error: 'Category not found' });
                }
            }

            // Update all products in a single transaction
            const result = await prisma.product.updateMany({
                where: {
                    id: { in: productIds }
                },
                data: {
                    categoryId: newCategoryId || null
                }
            });

            console.log(`✅ Bulk updated ${result.count} products`);

            return res.json({
                message: 'Products updated successfully',
                updatedCount: result.count
            });
        } catch (error) {
            console.error('Error bulk updating products:', error);
            return res.status(500).json({ error: 'Failed to bulk update products' });
        }
    }

    // PATCH /api/products/:id/visibility - Toggle product visibility
    static async toggleVisibility(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            console.log(`🔄 Toggle visibility for product ${id}: isActive=${isActive}`);

            // Validate product exists
            const product = await prisma.product.findUnique({
                where: { id }
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Update visibility
            const updatedProduct = await prisma.product.update({
                where: { id },
                data: { isActive: isActive === true || isActive === 'true' }
            });

            console.log(`✅ Product ${id} visibility set to ${updatedProduct.isActive}`);

            return res.json({
                message: updatedProduct.isActive ? 'Product is now visible' : 'Product is now hidden',
                isActive: updatedProduct.isActive
            });
        } catch (error) {
            console.error('Error toggling visibility:', error);
            return res.status(500).json({ error: 'Failed to toggle visibility' });
        }
    }
}

module.exports = { ProductController };
