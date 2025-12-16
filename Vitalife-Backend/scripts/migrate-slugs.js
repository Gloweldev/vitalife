/**
 * Migration script to add slugs to existing products
 * Run with: node scripts/migrate-slugs.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate a URL-friendly slug from a string
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
        .substring(0, 100);
}

async function generateUniqueSlug(prisma, baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.product.findFirst({
            where: {
                slug,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: { id: true },
        });

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;

        if (counter > 100) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
        }
    }

    return slug;
}

async function migrateSluge() {
    console.log('🔄 Starting slug migration...\n');

    try {
        // Get all products without slugs or with empty slugs
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        console.log(`📦 Found ${products.length} products\n`);

        let updated = 0;
        let skipped = 0;

        for (const product of products) {
            // Skip if already has a valid slug
            if (product.slug && product.slug.trim() !== '') {
                console.log(`⏭️  Skipped: "${product.name}" (already has slug: ${product.slug})`);
                skipped++;
                continue;
            }

            const baseSlug = generateSlug(product.name);
            const uniqueSlug = await generateUniqueSlug(prisma, baseSlug, product.id);

            await prisma.product.update({
                where: { id: product.id },
                data: { slug: uniqueSlug },
            });

            console.log(`✅ Updated: "${product.name}" → ${uniqueSlug}`);
            updated++;
        }

        console.log(`\n✨ Migration complete!`);
        console.log(`   Updated: ${updated} products`);
        console.log(`   Skipped: ${skipped} products`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

migrateSluge();
