const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper: Generate slug from name
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

// GET /api/blog/categories - Get all categories with post count
async function getCategories(req, res) {
    try {
        const categories = await prisma.blogCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        // Transform to include postCount
        const result = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            postCount: cat._count.posts,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
        }));

        return res.json(result);
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        return res.status(500).json({ error: 'Error fetching categories' });
    }
}

// POST /api/blog/categories - Create category
async function createCategory(req, res) {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Check if name already exists
        const existing = await prisma.blogCategory.findUnique({
            where: { name: name.trim() },
        });

        if (existing) {
            return res.status(409).json({ error: 'Category already exists' });
        }

        // Generate unique slug
        let slug = generateSlug(name);
        let counter = 1;
        while (await prisma.blogCategory.findUnique({ where: { slug } })) {
            slug = `${generateSlug(name)}-${counter}`;
            counter++;
        }

        const category = await prisma.blogCategory.create({
            data: {
                name: name.trim(),
                slug,
            },
        });

        console.log(`✅ Blog category created: ${name}`);

        return res.status(201).json(category);
    } catch (error) {
        console.error('Error creating blog category:', error);
        return res.status(500).json({ error: 'Error creating category' });
    }
}

// PUT /api/blog/categories/:id - Update category
async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Check if category exists
        const existing = await prisma.blogCategory.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if new name already exists (for other category)
        const duplicate = await prisma.blogCategory.findFirst({
            where: {
                name: name.trim(),
                id: { not: id },
            },
        });

        if (duplicate) {
            return res.status(409).json({ error: 'Category name already exists' });
        }

        // Generate new slug if name changed
        let slug = existing.slug;
        if (name.trim() !== existing.name) {
            slug = generateSlug(name);
            let counter = 1;
            while (await prisma.blogCategory.findFirst({
                where: { slug, id: { not: id } }
            })) {
                slug = `${generateSlug(name)}-${counter}`;
                counter++;
            }
        }

        const category = await prisma.blogCategory.update({
            where: { id },
            data: {
                name: name.trim(),
                slug,
            },
        });

        console.log(`✅ Blog category updated: ${name}`);

        return res.json(category);
    } catch (error) {
        console.error('Error updating blog category:', error);
        return res.status(500).json({ error: 'Error updating category' });
    }
}

// DELETE /api/blog/categories/:id - Delete category
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;

        // Check if category exists
        const existing = await prisma.blogCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete category (posts will have categoryId set to null due to onDelete: SetNull)
        await prisma.blogCategory.delete({
            where: { id },
        });

        console.log(`🗑️ Blog category deleted: ${existing.name} (${existing._count.posts} posts affected)`);

        return res.json({
            message: 'Category deleted',
            affectedPosts: existing._count.posts,
        });
    } catch (error) {
        console.error('Error deleting blog category:', error);
        return res.status(500).json({ error: 'Error deleting category' });
    }
}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
