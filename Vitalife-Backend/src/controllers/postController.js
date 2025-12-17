const { PrismaClient } = require('@prisma/client');
const { S3Service } = require('../services/s3Service');

const prisma = new PrismaClient();

// Helper: Generate slug from title
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

// Helper: Generate unique slug
async function generateUniqueSlug(baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.post.findFirst({
            where: {
                slug,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: { id: true },
        });

        if (!existing) return slug;

        slug = `${baseSlug}-${counter}`;
        counter++;

        if (counter > 100) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
        }
    }

    return slug;
}

// Helper: Sign presigned URLs for a post
async function signPostUrls(post) {
    if (!post) return post;

    const signedPost = { ...post };

    // Sign cover image if exists
    if (post.coverImage && !post.coverImage.startsWith('http')) {
        signedPost.coverImage = await S3Service.getLongPresignedUrl(post.coverImage);
    }

    // Sign images in content blocks
    if (post.content && Array.isArray(post.content)) {
        signedPost.content = await Promise.all(
            post.content.map(async (block) => {
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

    return signedPost;
}

// Calculate read time from content
function calculateReadTime(content) {
    if (!content || !Array.isArray(content)) return '1 min';

    let wordCount = 0;
    content.forEach(block => {
        if (block.type === 'text' || block.type === 'heading') {
            wordCount += (block.content || '').split(/\s+/).length;
        }
    });

    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min`;
}

// GET /api/posts - List posts (public)
async function getPosts(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'published',
            category,
            postType
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};

        // Only show published posts for public
        if (status === 'published') {
            where.status = 'published';
        }

        if (category) {
            where.category = category;
        }

        if (postType) {
            where.postType = postType;
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImage: true,
                    category: true,
                    postType: true,
                    status: true,
                    author: true,
                    readTime: true,
                    views: true,
                    publishedAt: true,
                    createdAt: true,
                },
            }),
            prisma.post.count({ where }),
        ]);

        // Sign cover images
        const signedPosts = await Promise.all(
            posts.map(async (post) => {
                if (post.coverImage && !post.coverImage.startsWith('http')) {
                    return {
                        ...post,
                        coverImage: await S3Service.getLongPresignedUrl(post.coverImage),
                    };
                }
                return post;
            })
        );

        return res.json({
            posts: signedPosts,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ error: 'Error fetching posts' });
    }
}

// GET /api/posts/:slug - Get post by slug (public)
async function getPostBySlug(req, res) {
    try {
        const { slug } = req.params;

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return res.status(400).json({ error: 'Invalid slug format' });
        }

        const post = await prisma.post.findUnique({
            where: { slug },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Only show published posts for public access
        if (post.status !== 'published') {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment views
        await prisma.post.update({
            where: { id: post.id },
            data: { views: { increment: 1 } },
        });

        // Sign all URLs
        const signedPost = await signPostUrls(post);

        return res.json(signedPost);
    } catch (error) {
        console.error('Error fetching post:', error);
        return res.status(500).json({ error: 'Error fetching post' });
    }
}

// POST /api/posts - Create post (admin)
async function createPost(req, res) {
    try {
        const {
            title,
            excerpt,
            coverImage,
            content,
            category,
            postType = 'article',
            status = 'draft',
            author,
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Generate unique slug
        const baseSlug = generateSlug(title);
        const slug = await generateUniqueSlug(baseSlug);

        // Calculate read time
        const readTime = calculateReadTime(content);

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                excerpt,
                coverImage,
                content: content || [],
                category,
                postType,
                status,
                author,
                readTime,
                publishedAt: status === 'published' ? new Date() : null,
            },
        });

        console.log(`✅ Post created: ${post.title} (${post.slug})`);

        return res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ error: 'Error creating post' });
    }
}

// PUT /api/posts/:id - Update post (admin)
async function updatePost(req, res) {
    try {
        const { id } = req.params;
        const {
            title,
            slug: newSlug,
            excerpt,
            coverImage,
            content,
            category,
            postType,
            status,
            author,
        } = req.body;

        const existingPost = await prisma.post.findUnique({
            where: { id },
        });

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        let slug = existingPost.slug;
        if (newSlug && newSlug !== existingPost.slug) {
            slug = await generateUniqueSlug(generateSlug(newSlug), id);
        } else if (title && title !== existingPost.title && !newSlug) {
            slug = await generateUniqueSlug(generateSlug(title), id);
        }

        const readTime = content ? calculateReadTime(content) : existingPost.readTime;

        let publishedAt = existingPost.publishedAt;
        if (status === 'published' && existingPost.status !== 'published') {
            publishedAt = new Date();
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                title: title || existingPost.title,
                slug,
                excerpt: excerpt !== undefined ? excerpt : existingPost.excerpt,
                coverImage: coverImage !== undefined ? coverImage : existingPost.coverImage,
                content: content !== undefined ? content : existingPost.content,
                category: category !== undefined ? category : existingPost.category,
                postType: postType || existingPost.postType,
                status: status || existingPost.status,
                author: author !== undefined ? author : existingPost.author,
                readTime,
                publishedAt,
            },
        });

        console.log(`✅ Post updated: ${updatedPost.title}`);

        return res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ error: 'Error updating post' });
    }
}

// DELETE /api/posts/:id - Delete post (admin)
async function deletePost(req, res) {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete cover image from S3 if exists
        if (post.coverImage && !post.coverImage.startsWith('http')) {
            try {
                await S3Service.deleteFile(post.coverImage);
            } catch (err) {
                console.warn('Failed to delete cover image:', err.message);
            }
        }

        // Delete content images from S3
        if (post.content && Array.isArray(post.content)) {
            for (const block of post.content) {
                if (block.type === 'image' && block.url && !block.url.startsWith('http')) {
                    try {
                        await S3Service.deleteFile(block.url);
                    } catch (err) {
                        console.warn('Failed to delete content image:', err.message);
                    }
                }
            }
        }

        await prisma.post.delete({
            where: { id },
        });

        console.log(`✅ Post deleted: ${post.title}`);

        return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ error: 'Error deleting post' });
    }
}

// GET /api/posts/admin/list - List all posts for admin (including drafts)
async function getAdminPosts(req, res) {
    try {
        const { page = 1, limit = 20, status, category } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.post.count({ where }),
        ]);

        // Sign cover images
        const signedPosts = await Promise.all(
            posts.map(async (post) => {
                if (post.coverImage && !post.coverImage.startsWith('http')) {
                    return {
                        ...post,
                        coverImage: await S3Service.getPresignedUrl(post.coverImage),
                    };
                }
                return post;
            })
        );

        return res.json({
            posts: signedPosts,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        return res.status(500).json({ error: 'Error fetching posts' });
    }
}

// GET /api/posts/admin/:id - Get post by ID for admin (includes drafts)
async function getPostById(req, res) {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Sign all URLs
        const signedPost = await signPostUrls(post);

        return res.json(signedPost);
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        return res.status(500).json({ error: 'Error fetching post' });
    }
}

// PATCH /api/posts/bulk-update - Bulk update posts
async function bulkUpdatePosts(req, res) {
    try {
        const { postIds, action, value } = req.body;

        if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ error: 'postIds array is required' });
        }

        if (!action) {
            return res.status(400).json({ error: 'action is required' });
        }

        const validActions = ['publish', 'unpublish', 'archive', 'delete', 'changeCategory'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ error: `Invalid action. Valid: ${validActions.join(', ')}` });
        }

        let result;

        switch (action) {
            case 'publish':
                result = await prisma.post.updateMany({
                    where: { id: { in: postIds } },
                    data: {
                        status: 'published',
                        publishedAt: new Date(),
                    },
                });
                break;

            case 'unpublish':
                result = await prisma.post.updateMany({
                    where: { id: { in: postIds } },
                    data: { status: 'draft' },
                });
                break;

            case 'archive':
                result = await prisma.post.updateMany({
                    where: { id: { in: postIds } },
                    data: { status: 'archived' },
                });
                break;

            case 'delete':
                // Get posts to delete their images
                const postsToDelete = await prisma.post.findMany({
                    where: { id: { in: postIds } },
                    select: { id: true, coverImage: true, content: true },
                });

                // Delete images from S3
                for (const post of postsToDelete) {
                    const imagesToDelete = [];

                    if (post.coverImage) {
                        imagesToDelete.push(post.coverImage);
                    }

                    if (Array.isArray(post.content)) {
                        post.content.forEach(block => {
                            if (block.type === 'image' && block.url && !block.url.startsWith('http')) {
                                imagesToDelete.push(block.url);
                            }
                        });
                    }

                    for (const key of imagesToDelete) {
                        try {
                            await S3Service.deleteFile(key);
                        } catch (err) {
                            console.warn(`Failed to delete image: ${key}`, err);
                        }
                    }
                }

                result = await prisma.post.deleteMany({
                    where: { id: { in: postIds } },
                });
                break;

            case 'changeCategory':
                result = await prisma.post.updateMany({
                    where: { id: { in: postIds } },
                    data: { categoryId: value || null },
                });
                break;
        }

        console.log(`✅ Bulk ${action}: ${result.count} posts affected`);

        return res.json({
            message: `Successfully ${action} ${result.count} posts`,
            count: result.count,
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        return res.status(500).json({ error: 'Error performing bulk update' });
    }
}

module.exports = {
    getPosts,
    getPostBySlug,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getAdminPosts,
    bulkUpdatePosts,
};
