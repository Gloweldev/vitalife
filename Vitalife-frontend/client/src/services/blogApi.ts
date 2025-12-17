/**
 * Blog API Service for Public Frontend
 * Uses native fetch with Next.js ISR caching
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types matching backend responses
export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

export interface ContentBlock {
    type: 'text' | 'heading' | 'image' | 'product' | 'paragraph' | 'list';
    content?: string;
    text?: string;
    url?: string;
    alt?: string;
    caption?: string;
    productId?: string;
    level?: 1 | 2 | 3;
    items?: string[];
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    coverImage?: string | null;
    publishedAt?: string;
    readTime?: string;
    postType: string;
    category?: BlogCategory | null;
    author?: string;
    views?: number;
    content?: ContentBlock[];
}

export interface BlogPostsResponse {
    posts: BlogPost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ProductPreview {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    category?: string | null;
    image?: string | null;
}

/**
 * Get published blog posts (list)
 * Uses ISR with 1 hour revalidation
 */
export async function getPublicPosts(options?: {
    page?: number;
    limit?: number;
    category?: string;
}): Promise<BlogPostsResponse> {
    try {
        const params = new URLSearchParams();

        if (options?.page) params.set('page', options.page.toString());
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.category) params.set('category', options.category);

        const response = await fetch(
            `${API_BASE_URL}/store/posts?${params.toString()}`,
            {
                next: { revalidate: 30 }, // 1 hour ISR
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch posts:', response.status);
            return {
                posts: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            };
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return {
            posts: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        };
    }
}

/**
 * Get single post by slug
 * Uses ISR with 1 hour revalidation
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/store/posts/${slug}`,
            {
                next: { revalidate: 30 }, // 1 hour ISR
            }
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

/**
 * Get product preview for blog embeds
 * Uses longer cache as product data changes less often
 */
export async function getProductPreview(productId: string): Promise<ProductPreview | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/store/posts/product-preview/${productId}`,
            {
                next: { revalidate: 30 }, // 1 hour ISR
            }
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching product preview:', error);
        return null;
    }
}

/**
 * Get blog categories with post count
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/store/blog-categories`,
            {
                next: { revalidate: 30 }, // 1 hour ISR
            }
        );

        if (!response.ok) {
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        return [];
    }
}

/**
 * Format date for display
 */
export function formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
