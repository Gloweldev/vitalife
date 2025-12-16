const { z } = require('zod');

// Product validation schema - updated for categoryId
const productSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(200),
    shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(500),
    fullDescription: z.string().min(20, 'Full description must be at least 20 characters'),
    categoryId: z.string().uuid().optional().nullable(),
    isFeatured: z.union([z.boolean(), z.string()]),
    flavors: z.array(z.string()).optional(),
    benefits: z.array(z.string()).min(1, 'At least one benefit required'),
});

// Category validation schema
const categorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
    description: z.string().optional(),
});

module.exports = {
    productSchema,
    categorySchema,
};
