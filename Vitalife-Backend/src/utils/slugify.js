/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A lowercase, URL-safe string
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')                     // Normalize unicode characters
        .replace(/[\u0300-\u036f]/g, '')      // Remove diacritics (accents)
        .replace(/[ñ]/g, 'n')                 // Replace ñ with n
        .replace(/[^a-z0-9\s-]/g, '')         // Remove non-alphanumeric chars
        .replace(/\s+/g, '-')                 // Replace spaces with hyphens
        .replace(/-+/g, '-')                  // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '')              // Trim hyphens from start/end
        .substring(0, 100);                   // Limit length
}

/**
 * Generate a unique slug by appending a number if necessary
 * @param prisma - Prisma client instance
 * @param baseSlug - The base slug to make unique
 * @param excludeId - Optional product ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 */
async function generateUniqueSlug(prisma, baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.product.findUnique({
            where: { slug },
            select: { id: true },
        });

        // If no product with this slug exists, or it's the same product (for updates)
        if (!existing || existing.id === excludeId) {
            return slug;
        }

        // Append counter and try again
        slug = `${baseSlug}-${counter}`;
        counter++;

        // Safety limit to prevent infinite loops
        if (counter > 100) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
        }
    }

    return slug;
}

module.exports = {
    generateSlug,
    generateUniqueSlug,
};
