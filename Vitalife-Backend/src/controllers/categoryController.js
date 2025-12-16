const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CategoryController {
    // Get all categories
    static async getAllCategories(req, res) {
        try {
            const categories = await prisma.category.findMany({
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: {
                    name: 'asc',
                },
            });

            // Transform to include product count
            const categoriesWithCount = categories.map(cat => ({
                ...cat,
                productCount: cat._count.products,
            }));

            return res.json(categoriesWithCount);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    // Get single category
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;

            const category = await prisma.category.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            return res.json({
                ...category,
                productCount: category._count.products,
            });
        } catch (error) {
            console.error('Error fetching category:', error);
            return res.status(500).json({ error: 'Failed to fetch category' });
        }
    }

    // Create category
    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;

            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    error: 'Category name must be at least 2 characters'
                });
            }

            // Check if category already exists
            const existing = await prisma.category.findUnique({
                where: { name: name.trim() }
            });

            if (existing) {
                return res.status(400).json({
                    error: 'Category with this name already exists'
                });
            }

            const category = await prisma.category.create({
                data: {
                    name: name.trim(),
                    description: description?.trim() || null,
                },
            });

            console.log('✅ Category created:', category.name);
            return res.status(201).json(category);
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ error: 'Failed to create category' });
        }
    }

    // Update category
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    error: 'Category name must be at least 2 characters'
                });
            }

            // Check if category exists
            const existing = await prisma.category.findUnique({
                where: { id }
            });

            if (!existing) {
                return res.status(404).json({ error: 'Category not found' });
            }

            // Check if new name conflicts with another category
            const conflict = await prisma.category.findFirst({
                where: {
                    name: name.trim(),
                    NOT: { id }
                }
            });

            if (conflict) {
                return res.status(400).json({
                    error: 'Another category with this name already exists'
                });
            }

            const category = await prisma.category.update({
                where: { id },
                data: {
                    name: name.trim(),
                    description: description?.trim() || null,
                },
            });

            console.log('✅ Category updated:', category.name);
            return res.json(category);
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).json({ error: 'Failed to update category' });
        }
    }

    // Delete category (products will have categoryId set to null)
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            // Get category with product count
            const category = await prisma.category.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { products: true }
                    }
                }
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            const affectedProductsCount = category._count.products;

            // Delete category (onDelete: SetNull will handle products)
            await prisma.category.delete({
                where: { id },
            });

            console.log(`✅ Category deleted: ${category.name}. ${affectedProductsCount} products now orphaned.`);

            return res.json({
                message: 'Category deleted successfully',
                affectedProducts: affectedProductsCount
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            return res.status(500).json({ error: 'Failed to delete category' });
        }
    }
}

module.exports = { CategoryController };
